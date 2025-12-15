from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action, api_view, permission_classes
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from django.db import transaction
from django.http import JsonResponse
from django.utils import timezone
from .serializers import (
    UsuarioSerializer,
    CustomTokenObtainPairSerializer,
    ClienteSerializer,
    ProdutoSerializer,
    CategoriaSerializer,
    VentaSerializer,
    VentaItemSerializer,
    CarritoSerializer,
    KanbanSerializer,
    KanbanCompletoSerializer,
    ColunaSerializer,
    CardSerializer,
    RegraAutomacaoSerializer,
    HistoricoMovimentacaoSerializer,
    LogNotificacaoSerializer
)
from .models import Cliente, Produto, Categoria, Venta, VentaItem, Carrito
from .models_kanban import Kanban, Coluna, Card, RegraAutomacao, HistoricoMovimentacao, LogNotificacao

Usuario = get_user_model()

class RegistroUsuarioView(CreateAPIView):
    queryset = Usuario.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UsuarioSerializer

    def create(self, request, *args, **kwargs):
        if request.user.rol not in ['admin', 'staff']:
            return Response(
                {'detail': 'Solo los administradores y staff pueden crear nuevos usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PerfilUsuarioView(RetrieveUpdateAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Usuario.objects.all()

    def get_object(self):
        if self.kwargs.get('pk'):
            return super().get_object()
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Se não é admin ou staff, não pode alterar roles nem zonas de acesso
        if request.user.rol not in ['admin', 'staff']:
            if 'rol' in request.data or 'zona_acesso' in request.data:
                return Response(
                    {'detail': 'Você não tem permissão para modificar roles ou zonas de acesso'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            if 'password' in request.data and request.data['password']:
                instance.set_password(request.data['password'])
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        if request.user.rol not in ['admin', 'staff']:
            return Response({'detail': 'Você não tem permissão para excluir usuários'}, 
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

    def get_queryset(self):
        queryset = Venta.objects.all()
        
        # Filtrar por cliente si se proporciona
        cliente_cedula = self.request.query_params.get('cliente', None)
        if cliente_cedula:
            queryset = queryset.filter(cliente_cedula=cliente_cedula)
        
        # Filtrar por fecha si se proporciona
        fecha_inicio = self.request.query_params.get('fecha_inicio', None)
        fecha_fin = self.request.query_params.get('fecha_fin', None)
        
        if fecha_inicio:
            queryset = queryset.filter(created_at__date__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(created_at__date__lte=fecha_fin)
        
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Criar venda direta e reduzir estoque de produtos"""
        try:
            with transaction.atomic():
                # Obter os itens da venda
                items_data = request.data.get('items', [])
                if not items_data:
                    return Response(
                        {'detail': 'A venda deve incluir pelo menos um produto'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Verificar estoque disponível para todos os produtos
                total_venda = 0
                items_validados = []
                
                for item_data in items_data:
                    produto_id = item_data.get('produto')
                    
                    # Validar e converter quantidade
                    try:
                        quantidade = int(item_data.get('quantidade', item_data.get('cantidad', 1)))
                        if quantidade <= 0:
                            return Response(
                                {'detail': 'A quantidade deve ser maior que 0'},
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    except (ValueError, TypeError):
                        return Response(
                            {'detail': 'A quantidade deve ser um número inteiro válido'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    preco_unitario = item_data.get('preco_unitario', item_data.get('precio_unitario'))
                    
                    try:
                        produto = Produto.objects.get(id=produto_id)
                    except Produto.DoesNotExist:
                        return Response(
                            {'detail': f'Produto com ID {produto_id} não encontrado'},
                            status=status.HTTP_404_NOT_FOUND
                        )
                    
                    if quantidade > produto.estoque:
                        return Response(
                            {'detail': f'Estoque insuficiente para {produto.nome}. Apenas {produto.estoque} unidades disponíveis.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validar e converter preço unitário
                    try:
                        if not preco_unitario:
                            preco_unitario = float(produto.preco)
                        else:
                            preco_unitario = float(preco_unitario)
                            if preco_unitario <= 0:
                                return Response(
                                    {'detail': 'O preço unitário deve ser maior que 0'},
                                    status=status.HTTP_400_BAD_REQUEST
                                )
                    except (ValueError, TypeError):
                        return Response(
                            {'detail': 'O preço unitário deve ser um número válido'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    subtotal = quantidade * preco_unitario
                    total_venda += subtotal
                    items_validados.append({
                        'produto': produto,
                        'quantidade': quantidade,
                        'preco_unitario': preco_unitario,
                        'subtotal': subtotal
                    })
                
                # Criar a venda
                venda_data = {
                    'cliente_cedula': request.data.get('cliente'),
                    'total': total_venda
                }
                venda = Venta.objects.create(**venda_data)
                
                # Criar os itens de venda e reduzir estoque
                for item_data in items_validados:
                    produto = item_data['produto']
                    quantidade = item_data['quantidade']
                    preco_unitario = item_data['preco_unitario']
                    
                    # Reduzir estoque
                    produto.reduzir_estoque(quantidade)
                    
                    # Criar item de venda
                    VentaItem.objects.create(
                        venda_id=venda.id,
                        produto_id=produto.id,
                        quantidade=quantidade,
                        preco_unitario=preco_unitario
                    )
                
                # Serializar y retornar la venda creada
                serializer = VentaSerializer(venda)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'detail': f'Error al procesar la venda: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        # Temporalmente permitir que cualquier usuario autenticado elimine vendas
        # En producción, descomentar la validación de roles:
        # if request.user.rol not in ['admin', 'staff']:
        #     return Response(
        #         {'detail': 'Solo los administradores y staff pueden eliminar vendas'},
        #         status=status.HTTP_403_FORBIDDEN
        #     )
        
        # Obtener la instancia de la venda
        instance = self.get_object()
        
        # Eliminar todos los VentaItem relacionados antes de eliminar la venda
        VentaItem.objects.filter(venda_id=instance.id).delete()
        
        # Ahora eliminar la venda
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def procesar_desde_carrito(self, request):
        """Processa uma venda do carrinho e reduz o estoque"""
        session_id = request.data.get('session_id')
        usuario_id = request.data.get('usuario_id')
        cliente_cedula = request.data.get('cliente_cedula')
        
        if not session_id and not usuario_id:
            return Response(
                {'detail': 'É necessário session_id ou usuario_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Obter itens do carrinho
                if session_id:
                    carrito_items = Carrito.objects.filter(session_id=session_id)
                else:
                    carrito_items = Carrito.objects.filter(usuario_id=usuario_id)
                
                if not carrito_items.exists():
                    return Response(
                        {'detail': 'O carrinho está vazio'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Verificar estoque disponível para todos os produtos
                total_venda = 0
                items_validados = []
                
                for item in carrito_items:
                    produto = item.get_produto()
                    if not produto:
                        return Response(
                            {'detail': f'Produto com ID {item.produto_id} não encontrado'},
                            status=status.HTTP_404_NOT_FOUND
                        )
                    
                    quantidade_item = getattr(item, 'quantidade', getattr(item, 'cantidad', 1))
                    preco_unitario_item = getattr(item, 'preco_unitario', getattr(item, 'precio_unitario', 0))
                    
                    if not produto.tem_estoque(quantidade_item):
                        return Response(
                            {'detail': f'Estoque insuficiente para {produto.nome}. Apenas {produto.estoque} unidades disponíveis.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    subtotal = quantidade_item * preco_unitario_item
                    total_venda += subtotal
                    items_validados.append({
                        'produto': produto,
                        'item': item,
                        'subtotal': subtotal
                    })
                
                # Criar a venda
                venda = Venta.objects.create(
                    cliente_cedula=cliente_cedula,
                    total=total_venda
                )
                
                # Criar os itens de venda e reduzir estoque
                for item_data in items_validados:
                    produto = item_data['produto']
                    carrito_item = item_data['item']
                    
                    quantidade_item = getattr(carrito_item, 'quantidade', getattr(carrito_item, 'cantidad', 1))
                    preco_unitario_item = getattr(carrito_item, 'preco_unitario', getattr(carrito_item, 'precio_unitario', 0))
                    
                    # Reduzir estoque
                    produto.reduzir_estoque(quantidade_item)
                    
                    # Criar item de venda
                    VentaItem.objects.create(
                        venda_id=venda.id,
                        produto_id=produto.id,
                        quantidade=quantidade_item,
                        preco_unitario=preco_unitario_item
                    )
                
                # Limpar carrinho
                carrito_items.delete()
                
                # Serializar e retornar a venda criada
                serializer = VentaSerializer(venda)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'detail': f'Erro ao processar a venda: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VentaItemViewSet(viewsets.ModelViewSet):
    queryset = VentaItem.objects.all()
    serializer_class = VentaItemSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

    def get_queryset(self):
        queryset = VentaItem.objects.all()
        
        # Filtrar por venda si se proporciona
        venda_id = self.request.query_params.get('venda', None)
        if venda_id:
            queryset = queryset.filter(venda_id=venda_id)
        
        return queryset.order_by('-created_at')

class ListaUsuariosView(ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        queryset = Usuario.objects.select_related().all()
        if self.request.user.rol not in ['admin', 'staff']:
            queryset = queryset.filter(id=self.request.user.id)
        return queryset.order_by('-created_at')

class PerfilUsuarioView(RetrieveUpdateAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_object(self):
        if self.kwargs.get('pk'):
            return Usuario.objects.select_related().get(pk=self.kwargs['pk'])
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if request.user.rol not in ['admin', 'staff']:
            if 'rol' in request.data or 'zona_acceso' in request.data:
                return Response(
                    {'detail': 'Você não tem permissão para modificar roles ou zonas de acesso'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        if request.user.rol not in ['admin', 'staff']:
            return Response({'detail': 'Você não tem permissão para excluir usuários'}, 
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class UsuarioDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Usuario.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Se não é admin ou staff, não pode alterar roles nem zonas de acesso
        if request.user.rol not in ['admin', 'staff'] and request.user.id != instance.id:
            return Response(
                {'detail': 'Você não tem permissão para modificar outros usuários'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.rol not in ['admin', 'staff']:
            if 'rol' in request.data or 'zona_acesso' in request.data:
                return Response(
                    {'detail': 'Você não tem permissão para modificar roles ou zonas de acesso'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            if 'password' in request.data and request.data['password']:
                instance.set_password(request.data['password'])
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

    def destroy(self, request, *args, **kwargs):
        if request.user.rol not in ['admin', 'staff']:
            return Response(
                {'detail': 'Você não tem permissão para excluir usuários'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            usuario = self.get_object()
            if usuario.id == request.user.id:
                return Response(
                    {'detail': 'Você não pode excluir seu próprio usuário'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            usuario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:
            return Response(
                {'detail': 'Usuário não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    def get_queryset(self):
        # Si es admin o staff, puede ver todos los usuarios
        if self.request.user.rol in ['admin', 'staff']:
            return Usuario.objects.all().order_by('-created_at')
        # Si no es admin o staff, solo puede verse a sí mismo
        return Usuario.objects.filter(id=self.request.user.id)

    def get_object(self):
        obj = Usuario.objects.get(pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj

    def delete(self, request, *args, **kwargs):
        if request.user.rol not in ['admin', 'staff']:
            return Response(
                {'detail': 'No tienes permiso para eliminar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            usuario = self.get_object()
            if usuario.id == request.user.id:
                return Response(
                    {'detail': 'No puedes eliminar tu propio usuario'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            usuario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:
            return Response(
                {'detail': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'cedula'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

    def get_queryset(self):
        return Categoria.objects.all().order_by('nome')

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

    def get_queryset(self):
        queryset = Produto.objects.all().order_by('-created_at')
        categoria = self.request.query_params.get('categoria', None)
        if categoria is not None:
            queryset = queryset.filter(categoria_id=categoria)
        return queryset

    def create(self, request, *args, **kwargs):
        if request.user.rol not in ['admin', 'staff']:
            return Response(
                {'detail': 'Apenas administradores e staff podem criar produtos'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.rol not in ['admin', 'staff']:
            return Response(
                {'detail': 'Apenas administradores e staff podem modificar produtos'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.rol not in ['admin', 'staff']:
            return Response(
                {'detail': 'Apenas administradores e staff podem excluir produtos'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

class CarritoViewSet(viewsets.ModelViewSet):
    queryset = Carrito.objects.all()
    serializer_class = CarritoSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

    def get_queryset(self):
        queryset = Carrito.objects.all()
        
        # Filtrar por session_id o usuario_id
        session_id = self.request.query_params.get('session_id', None)
        usuario_id = self.request.query_params.get('usuario_id', None)
        
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        elif usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)
        
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Agregar produto al carrito"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                produto_id = serializer.validated_data['produto_id']
                quantidade = serializer.validated_data.get('quantidade', serializer.validated_data.get('cantidad', 1))
                session_id = serializer.validated_data.get('session_id')
                usuario_id = serializer.validated_data.get('usuario_id')
                
                produto = Produto.objects.get(id=produto_id)
                
                # Verificar si el produto ya está en el carrito
                existing_item = None
                if session_id:
                    existing_item = Carrito.objects.filter(
                        session_id=session_id, 
                        produto_id=produto_id
                    ).first()
                elif usuario_id:
                    existing_item = Carrito.objects.filter(
                        usuario_id=usuario_id, 
                        produto_id=produto_id
                    ).first()
                
                if existing_item:
                    # Verificar estoque total (existente + novo)
                    nova_quantidade = existing_item.quantidade + quantidade
                    if nova_quantidade > produto.estoque:
                        return Response(
                            {'detail': f'Estoque insuficiente. Apenas {produto.estoque} unidades disponíveis e você já tem {existing_item.quantidade} no carrinho.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    existing_item.quantidade = nova_quantidade
                    existing_item.save()
                    serializer = self.get_serializer(existing_item)
                else:
                    # Verificar estoque para novo item
                    if quantidade > produto.estoque:
                        return Response(
                            {'detail': f'Estoque insuficiente. Apenas {produto.estoque} unidades disponíveis.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    carrito_item = serializer.save()
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
            except Produto.DoesNotExist:
                return Response(
                    {'detail': 'O produto não existe'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except Exception as e:
                return Response(
                    {'detail': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Atualizar quantidade no carrinho"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Verificar estoque antes de atualizar
        quantidade_param = request.data.get('quantidade', request.data.get('cantidad'))
        if quantidade_param:
            try:
                nova_quantidade = int(quantidade_param)
                if nova_quantidade <= 0:
                    return Response(
                        {'detail': 'A quantidade deve ser maior que 0'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except (ValueError, TypeError):
                return Response(
                    {'detail': 'A quantidade deve ser um número inteiro válido'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            produto = instance.get_produto()
            if produto and nova_quantidade > produto.estoque:
                return Response(
                    {'detail': f'Estoque insuficiente. Apenas {produto.estoque} unidades disponíveis.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            instance.quantidade = nova_quantidade
            instance.save()
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Remover produto do carrinho"""
        return super().destroy(request, *args, **kwargs)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_welcome(request):
    """Vista de boas-vindas para a raiz da API"""
    welcome_data = {
        'message': 'Bem-vindo à API ERP TIKNO! 🚀',
        'description': 'Sistema de gestão empresarial completo com funcionalidades de inventário, vendas e administração de usuários.',
        'version': '1.0.0',
        'status': 'active',
        'timestamp': timezone.now().isoformat(),
        'endpoints': {
            'admin': '/admin/',
            'api_root': '/api/',
            'authentication': {
                'login': '/api/auth/login/',
                'register': '/api/auth/register/',
                'profile': '/api/auth/profile/'
            },
            'resources': {
                'usuarios': '/api/usuarios/',
                'clientes': '/api/clientes/',
                'produtos': '/api/produtos/',
                'categorias': '/api/categorias/',
                'vendas': '/api/vendas/',
                'carrito': '/api/carrito/'
            }
        },
        'features': [
            'Gestão de usuários com roles e permissões',
            'Sistema de autenticação JWT',
            'Administração de produtos e inventário',
            'Gestão de clientes',
            'Sistema de vendas e faturamento',
            'Carrinho de compras',
            'Categorização de produtos',
            'Controle de estoque automático'
        ],
        'tech_stack': {
            'backend': 'Django REST Framework',
            'database': 'PostgreSQL (Supabase)',
            'authentication': 'JWT',
            'deployment': 'Render'
        },
        'contact': {
            'developer': 'ERP TIKNO Team',
            'support': 'Contate o administrador do sistema'
        }
    }
    
    return JsonResponse(welcome_data, json_dumps_params={'indent': 2})


# ============================================================================
# KANBAN VIEWSETS
# ============================================================================

class KanbanViewSet(viewsets.ModelViewSet):
    """ViewSet para Quadros Kanban"""
    queryset = Kanban.objects.all()
    serializer_class = KanbanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retornar apenas quadros do usuário logado"""
        return Kanban.objects.filter(criado_por=self.request.user).order_by('-data_criacao')

    def perform_create(self, serializer):
        """Criar quadro com o usuário atual como criador"""
        serializer.save(criado_por=self.request.user)

    @action(detail=True, methods=['get'])
    def completo(self, request, pk=None):
        """Retornar quadro completo com colunas e cards"""
        kanban = self.get_object()
        serializer = KanbanCompletoSerializer(kanban)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def regras(self, request, pk=None):
        """Listar regras de automação do quadro"""
        kanban = self.get_object()
        regras = RegraAutomacao.objects.filter(kanban=kanban, ativo=True)
        serializer = RegraAutomacaoSerializer(regras, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def criar_regra(self, request, pk=None):
        """Criar regra de automação para o quadro"""
        kanban = self.get_object()
        data = request.data.copy()
        data['kanban'] = kanban.id
        serializer = RegraAutomacaoSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ColunaViewSet(viewsets.ModelViewSet):
    """ViewSet para Colunas do Kanban"""
    queryset = Coluna.objects.all()
    serializer_class = ColunaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtrar colunas por quadro se fornecido"""
        queryset = Coluna.objects.all().order_by('ordem')
        kanban_id = self.request.query_params.get('kanban', None)
        if kanban_id:
            queryset = queryset.filter(kanban_id=kanban_id)
        return queryset

    def create(self, request, *args, **kwargs):
        """Override create to handle ordem before validation"""
        # Get kanban_id from request data
        kanban_id = request.data.get('kanban')
        if not kanban_id:
            return Response(
                {'detail': 'kanban é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            kanban = Kanban.objects.get(id=kanban_id)
            # Verificar permissão
            if kanban.criado_por != request.user:
                raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")

            # Auto-incrementar ordem
            ultima_coluna = Coluna.objects.filter(kanban=kanban).order_by('-ordem').first()
            ordem = (ultima_coluna.ordem + 1) if ultima_coluna else 0

            # Create data with ordem
            data = request.data.copy()
            data['ordem'] = ordem

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Kanban.DoesNotExist:
            return Response(
                {'detail': 'Kanban não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    def perform_create(self, serializer):
        """Just save - ordem is already set in create()"""
        serializer.save()

    def perform_update(self, serializer):
        """Validar permissão antes de atualizar"""
        kanban = serializer.instance.kanban
        if kanban.criado_por != self.request.user:
            raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")
        serializer.save()

    def perform_destroy(self, instance):
        """Validar permissão antes de deletar"""
        if instance.kanban.criado_por != self.request.user:
            raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")
        instance.delete()

    @action(detail=False, methods=['post'])
    def reordenar(self, request):
        """Reordenar colunas"""
        colunas_ordem = request.data.get('colunas', [])  # [{'id': 1, 'ordem': 0}, ...]

        try:
            with transaction.atomic():
                for item in colunas_ordem:
                    coluna = Coluna.objects.get(id=item['id'])
                    # Verificar permissão
                    if coluna.kanban.criado_por != request.user:
                        raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")
                    coluna.ordem = item['ordem']
                    coluna.save()

                return Response({'detail': 'Colunas reordenadas com sucesso'})
        except Coluna.DoesNotExist:
            return Response(
                {'detail': 'Coluna não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class CardViewSet(viewsets.ModelViewSet):
    """ViewSet para Cards do Kanban"""
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtrar cards por coluna ou kanban"""
        queryset = Card.objects.all().order_by('ordem', '-data_criacao')

        coluna_id = self.request.query_params.get('coluna', None)
        if coluna_id:
            queryset = queryset.filter(coluna_id=coluna_id)

        kanban_id = self.request.query_params.get('kanban', None)
        if kanban_id:
            queryset = queryset.filter(coluna__kanban_id=kanban_id)

        return queryset

    def create(self, request, *args, **kwargs):
        """Override create to handle ordem before validation"""
        coluna_id = request.data.get('coluna')
        if not coluna_id:
            return Response(
                {'detail': 'coluna é obrigatória'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            coluna = Coluna.objects.get(id=coluna_id)
            # Verificar permissão
            if coluna.kanban.criado_por != request.user:
                raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")

            # Verificar limite de cards
            if not coluna.pode_adicionar_card():
                return Response(
                    {'detail': f'A coluna atingiu o limite de {coluna.limite_cards} cards'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Auto-incrementar ordem
            ultimo_card = Card.objects.filter(coluna=coluna).order_by('-ordem').first()
            ordem = (ultimo_card.ordem + 1) if ultimo_card else 0

            # Create data with ordem
            data = request.data.copy()
            data['ordem'] = ordem

            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Coluna.DoesNotExist:
            return Response(
                {'detail': 'Coluna não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )

    def perform_create(self, serializer):
        """Just save - ordem is already set in create()"""
        serializer.save()

    def perform_update(self, serializer):
        """Validar permissão antes de atualizar"""
        kanban = serializer.instance.coluna.kanban
        if kanban.criado_por != self.request.user:
            raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")
        serializer.save()

    def perform_destroy(self, instance):
        """Validar permissão antes de deletar"""
        if instance.coluna.kanban.criado_por != self.request.user:
            raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")
        instance.delete()

    @action(detail=True, methods=['post'])
    def mover(self, request, pk=None):
        """Mover card entre colunas"""
        card = self.get_object()
        coluna_destino_id = request.data.get('coluna_destino')
        nova_ordem = request.data.get('ordem', 0)

        try:
            with transaction.atomic():
                # Verificar permissão
                if card.coluna.kanban.criado_por != request.user:
                    raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")

                coluna_origem = card.coluna
                coluna_destino = Coluna.objects.get(id=coluna_destino_id)

                # Verificar se as colunas são do mesmo quadro
                if coluna_origem.kanban != coluna_destino.kanban:
                    return Response(
                        {'detail': 'As colunas devem pertencer ao mesmo quadro'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Verificar limite da coluna destino (se for diferente)
                if coluna_origem != coluna_destino:
                    if not coluna_destino.pode_adicionar_card():
                        return Response(
                            {'detail': f'A coluna destino atingiu o limite de {coluna_destino.limite_cards} cards'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # Atualizar card primeiro
                card.coluna = coluna_destino
                card.ordem = nova_ordem
                card.save(update_fields=['coluna', 'ordem'])

                # Registrar histórico após atualização
                HistoricoMovimentacao.objects.create(
                    card=card,
                    coluna_origem=coluna_origem,
                    coluna_destino=coluna_destino,
                    usuario=request.user,
                    observacao=request.data.get('observacao', '')
                )

                serializer = CardSerializer(card)
                return Response(serializer.data)

        except Coluna.DoesNotExist:
            return Response(
                {'detail': 'Coluna destino não encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def historico(self, request, pk=None):
        """Obter histórico de movimentações do card"""
        card = self.get_object()
        historico = HistoricoMovimentacao.objects.filter(card=card).order_by('-data')
        serializer = HistoricoMovimentacaoSerializer(historico, many=True)
        return Response(serializer.data)


class RegraAutomacaoViewSet(viewsets.ModelViewSet):
    """ViewSet para Regras de Automação"""
    queryset = RegraAutomacao.objects.all()
    serializer_class = RegraAutomacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtrar regras por quadro"""
        queryset = RegraAutomacao.objects.all()
        kanban_id = self.request.query_params.get('kanban', None)
        if kanban_id:
            queryset = queryset.filter(kanban_id=kanban_id)
        return queryset.order_by('nome')

    def perform_create(self, serializer):
        """Validar permissão antes de criar"""
        kanban = serializer.validated_data['kanban']
        if kanban.criado_por != self.request.user:
            raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")
        serializer.save()

    def perform_update(self, serializer):
        """Validar permissão antes de atualizar"""
        if serializer.instance.kanban.criado_por != self.request.user:
            raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")
        serializer.save()

    def perform_destroy(self, instance):
        """Validar permissão antes de deletar"""
        if instance.kanban.criado_por != self.request.user:
            raise permissions.PermissionDenied("Você não tem permissão para modificar este quadro")
        instance.delete()


class HistoricoMovimentacaoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para Histórico de Movimentações (apenas leitura)"""
    queryset = HistoricoMovimentacao.objects.all()
    serializer_class = HistoricoMovimentacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtrar histórico por card ou kanban"""
        queryset = HistoricoMovimentacao.objects.all().order_by('-data')

        card_id = self.request.query_params.get('card', None)
        if card_id:
            queryset = queryset.filter(card_id=card_id)

        kanban_id = self.request.query_params.get('kanban', None)
        if kanban_id:
            queryset = queryset.filter(card__coluna__kanban_id=kanban_id)

        return queryset


class LogNotificacaoViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para Log de Notificações (apenas leitura)"""
    queryset = LogNotificacao.objects.all()
    serializer_class = LogNotificacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtrar logs por card, regra ou kanban"""
        queryset = LogNotificacao.objects.all().order_by('-data_envio')

        card_id = self.request.query_params.get('card', None)
        if card_id:
            queryset = queryset.filter(card_id=card_id)

        regra_id = self.request.query_params.get('regra', None)
        if regra_id:
            queryset = queryset.filter(regra_id=regra_id)

        kanban_id = self.request.query_params.get('kanban', None)
        if kanban_id:
            queryset = queryset.filter(card__coluna__kanban_id=kanban_id)

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset
