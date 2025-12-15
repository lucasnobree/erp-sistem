from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    """Serviço para envio de notificações por email"""
    
    @staticmethod
    def send_email_notification(to_email, subject, message, card=None):
        """
        Envia notificação por email
        
        Args:
            to_email (str): Email do destinatário
            subject (str): Assunto do email
            message (str): Mensagem do email
            card (Card, optional): Card relacionado à notificação
        
        Returns:
            bool: True se enviado com sucesso, False caso contrário
        """
        try:
            # Criar contexto para o template
            context = {
                'message': message,
                'card': card,
                'sistema_nome': 'ERP Sistema',
            }
            
            # Template HTML simplificado
            card_details = ""
            if card:
                card_details = f"""
                <div style="background: #f1f3f4; padding: 15px; border-radius: 4px; margin-top: 20px;">
                    <h3 style="margin: 0 0 10px 0; color: #667eea;">📋 Detalhes do Card:</h3>
                    <p style="margin: 5px 0;"><strong>Título:</strong> {card.titulo}</p>
                    {f"<p style='margin: 5px 0;'><strong>Cliente:</strong> {card.cliente.nome}</p>" if card and card.cliente else ""}
                    {f"<p style='margin: 5px 0;'><strong>Responsável:</strong> {card.responsavel.nome}</p>" if card and card.responsavel else ""}
                    {f"<p style='margin: 5px 0;'><strong>Vencimento:</strong> {card.data_vencimento.strftime('%d/%m/%Y')}</p>" if card and card.data_vencimento else ""}
                </div>
                """
            
            html_message = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">🔔 ERP Sistema</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Notificação Automática</p>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
                        <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea;">
                            <p style="font-size: 16px; margin: 0 0 15px 0;">{message}</p>
                            {card_details}
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; font-size: 14px; margin: 0;">
                                Esta é uma notificação automática do ERP Sistema<br>
                                Não responda este email
                            </p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Enviar email
            send_mail(
                subject=f"[ERP Sistema] {subject}",
                message=strip_tags(html_message),  # Versão texto
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                html_message=html_message,  # Versão HTML
                fail_silently=False,
            )
            
            logger.info(f"Email enviado com sucesso para {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar email para {to_email}: {str(e)}")
            return False
    
    @staticmethod
    def process_template_variables(template, card, coluna=None):
        """
        Processa variáveis do template de mensagem
        
        Args:
            template (str): Template da mensagem com variáveis
            card (Card): Card relacionado
            coluna (Coluna, optional): Coluna relacionada
        
        Returns:
            str: Mensagem com variáveis substituídas
        """
        try:
            # Substituir variáveis básicas
            message = template.replace('{card_titulo}', card.titulo or '')
            
            # Variáveis do cliente
            if card.cliente:
                message = message.replace('{cliente_nome}', card.cliente.nome or '')
            else:
                message = message.replace('{cliente_nome}', 'Cliente não informado')
            
            # Variáveis do produto
            if card.produto:
                message = message.replace('{produto_nome}', card.produto.nome or '')
            else:
                message = message.replace('{produto_nome}', 'Produto não informado')
            
            # Variáveis do responsável
            if card.responsavel:
                message = message.replace('{responsavel_nome}', card.responsavel.nome or '')
            else:
                message = message.replace('{responsavel_nome}', 'Responsável não informado')
            
            # Variáveis de data
            if card.data_vencimento:
                message = message.replace('{data_vencimento}', card.data_vencimento.strftime('%d/%m/%Y'))
            else:
                message = message.replace('{data_vencimento}', 'Data não informada')
            
            # Variáveis da coluna
            if coluna:
                message = message.replace('{coluna_nome}', coluna.nome or '')
            else:
                message = message.replace('{coluna_nome}', 'Coluna não informada')
            
            return message
            
        except Exception as e:
            logger.error(f"Erro ao processar template: {str(e)}")
            return template  # Retorna template original em caso de erro