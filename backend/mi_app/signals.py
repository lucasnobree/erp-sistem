from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models_kanban import Card, HistoricoMovimentacao, RegraAutomacao, LogNotificacao
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Card)
def process_card_automation(sender, instance, created, **kwargs):
    """
    Processa automações quando um card é criado ou atualizado
    """
    try:
        # Verificar se há regras ativas no kanban
        regras_ativas = RegraAutomacao.objects.filter(
            kanban=instance.coluna.kanban,
            ativo=True
        )
        
        # Se não há regras ativas, não fazer nada
        if not regras_ativas.exists():
            return
        
        for regra in regras_ativas:
            should_trigger = False
            
            # Verificar se deve disparar a regra
            if regra.tipo_trigger == 'criacao' and created:
                should_trigger = True
                
            elif regra.tipo_trigger == 'movimentacao' and not created:
                # Verificar se foi movido para a coluna específica
                if regra.coluna_trigger:
                    if instance.coluna.id == regra.coluna_trigger.id:
                        should_trigger = True
                else:
                    # Se não tem coluna específica, qualquer movimentação dispara
                    should_trigger = True
            
            elif regra.tipo_trigger == 'atribuicao' and not created:
                # Verificar se foi atribuído um responsável
                if instance.responsavel:
                    should_trigger = True
            
            # Disparar notificação se necessário
            if should_trigger:
                send_automation_notification(regra, instance)
                
    except Exception as e:
        logger.error(f"Erro ao processar automação do card {instance.id}: {str(e)}")

def send_automation_notification(regra, card):
    """
    Envia notificação baseada na regra de automação
    """
    try:
        # Processar template da mensagem com variáveis simples
        message = regra.template_mensagem
        
        # Substituir variáveis básicas
        if card.cliente:
            message = message.replace('{cliente_nome}', card.cliente.nome)
        if card.produto:
            message = message.replace('{produto_nome}', card.produto.nome)
        if card.responsavel:
            message = message.replace('{responsavel_nome}', card.responsavel.nome)
        if card.data_vencimento:
            message = message.replace('{data_vencimento}', card.data_vencimento.strftime('%d/%m/%Y'))
        
        message = message.replace('{card_titulo}', card.titulo)
        message = message.replace('{coluna_nome}', card.coluna.nome)
        
        # Determinar destinatário
        to_email = None
        destinatario_nome = ""
        
        if regra.acao_whatsapp == 'cliente' and card.cliente:
            to_email = card.cliente.email
            destinatario_nome = card.cliente.nome
            
        elif regra.acao_whatsapp == 'responsavel' and card.responsavel:
            to_email = card.responsavel.email
            destinatario_nome = card.responsavel.nome
            
        elif regra.acao_whatsapp == 'admin':
            # Buscar admin do sistema (primeiro superuser)
            from .models import Usuario
            admin = Usuario.objects.filter(is_superuser=True).first()
            if admin:
                to_email = admin.email
                destinatario_nome = admin.nome
        
        # Registrar log da notificação (sem enviar email real por enquanto)
        if to_email:
            LogNotificacao.objects.create(
                card=card,
                regra=regra,
                destinatario=f"{destinatario_nome} <{to_email}>",
                mensagem=message,
                status='enviado',
                erro_mensagem=None
            )
            
            logger.info(f"Notificação registrada para {to_email}")
        else:
            # Registrar log de erro
            LogNotificacao.objects.create(
                card=card,
                regra=regra,
                destinatario="Destinatário não encontrado",
                mensagem=message,
                status='erro',
                erro_mensagem='Email do destinatário não encontrado'
            )
            
            logger.warning(f"Destinatário não encontrado para regra {regra.nome}")
            
    except Exception as e:
        # Registrar log de erro
        try:
            LogNotificacao.objects.create(
                card=card,
                regra=regra,
                destinatario="Erro no processamento",
                mensagem=regra.template_mensagem,
                status='erro',
                erro_mensagem=str(e)
            )
        except:
            pass
            
        logger.error(f"Erro ao enviar notificação: {str(e)}")

@receiver(post_save, sender=HistoricoMovimentacao)
def log_card_movement(sender, instance, created, **kwargs):
    """
    Log adicional para movimentações de cards
    """
    if created:
        logger.info(f"Card {instance.card.titulo} movido para {instance.coluna_destino.nome}")
        
        # Verificar se há regras de automação para movimentação
        try:
            regras_movimentacao = RegraAutomacao.objects.filter(
                kanban=instance.card.coluna.kanban,
                tipo_trigger='movimentacao',
                ativo=True
            )
            
            for regra in regras_movimentacao:
                if regra.coluna_trigger and regra.coluna_trigger.id == instance.coluna_destino.id:
                    send_automation_notification(regra, instance.card)
        except Exception as e:
            logger.error(f"Erro ao processar automação de movimentação: {str(e)}")