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
                
            # Movimentação é processada apenas no HistoricoMovimentacao signal
            
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
        kanban_cliente = card.coluna.kanban.cliente
        if kanban_cliente:
            message = message.replace('{cliente_nome}', kanban_cliente.nome)
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
        
        if regra.acao_whatsapp == 'cliente':
            # Usar cliente do quadro Kanban em vez do card
            kanban = card.coluna.kanban
            
            kanban_cliente = kanban.cliente
            if kanban_cliente:
                to_email = getattr(kanban_cliente, 'email', None)
                destinatario_nome = kanban_cliente.nome
            
        elif regra.acao_whatsapp == 'responsavel' and card.responsavel:
            to_email = getattr(card.responsavel, 'email', None)
            destinatario_nome = card.responsavel.nome
            
        elif regra.acao_whatsapp == 'admin':
            # Buscar admin do sistema (primeiro superuser)
            from .models import Usuario
            admin = Usuario.objects.filter(is_superuser=True).first()
            if admin:
                to_email = getattr(admin, 'email', None)
                destinatario_nome = admin.nome
        
        # Enviar email real
        if to_email and to_email.strip():
            try:
                from django.core.mail import EmailMultiAlternatives
                from django.template.loader import render_to_string
                from django.conf import settings
                
                # Renderizar template HTML
                html_content = render_to_string('emails/kanban_notification.html', {
                    'card': card,
                    'regra': regra,
                    'mensagem_processada': message,
                    'destinatario_nome': destinatario_nome
                })
                
                # Criar email com HTML
                email = EmailMultiAlternatives(
                    subject=f'Notificação Kanban - {card.titulo}',
                    body=message,  # Texto plano como fallback
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[to_email]
                )
                email.attach_alternative(html_content, "text/html")
                email.send()
                
                # Registrar log de sucesso
                LogNotificacao.objects.create(
                    card=card,
                    regra=regra,
                    destinatario=f"{destinatario_nome} <{to_email}>",
                    mensagem=message,
                    status='enviado',
                    erro_mensagem=None
                )
                

                
            except Exception as email_error:
                # Registrar log de erro no envio
                LogNotificacao.objects.create(
                    card=card,
                    regra=regra,
                    destinatario=f"{destinatario_nome} <{to_email}>",
                    mensagem=message,
                    status='erro',
                    erro_mensagem=f'Erro ao enviar email: {str(email_error)}'
                )
                
                logger.error(f"Erro ao enviar email para {to_email}: {email_error}")
        else:
            # Registrar log de erro com mais detalhes
            erro_msg = f'Email inválido: "{to_email}"'
            if regra.acao_whatsapp == 'cliente':
                kanban_cliente = card.coluna.kanban.cliente
                if not kanban_cliente:
                    erro_msg = 'Quadro não possui cliente associado'
                else:
                    erro_msg = f'Cliente do quadro "{kanban_cliente.nome}" não possui email válido'
            elif regra.acao_whatsapp == 'responsavel':
                if not card.responsavel:
                    erro_msg = 'Card não possui responsável associado'
                else:
                    erro_msg = f'Responsável "{card.responsavel.nome}" não possui email válido'
            
            LogNotificacao.objects.create(
                card=card,
                regra=regra,
                destinatario=f"{destinatario_nome or 'N/A'}",
                mensagem=message,
                status='erro',
                erro_mensagem=erro_msg
            )
            
            logger.warning(f"Destinatário não encontrado para regra {regra.nome}: {erro_msg}")
            
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