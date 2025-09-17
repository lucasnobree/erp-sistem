# Sistema


# Front-end

## Instalar dependencias
- yarn install 

## Rodar o projeto
- npm run dev


# Back-end 

## Instalar python
- versão Python 3.13.7

## criar ambiente virtual 
- py -m venv .venv

## Entrar/Ativar ambiente virtual
- .venv\Scripts\activate

## Baixar as dependencias do projeto 
- pip install -r .\requirements.txt


# Banco

## Instalar o Docker Desktop

## Criar o container no banco
- docker compose up -d

## Conectar com o banco com a extensão Postgress/DBeaver

## Fazer a migração com o banco
- py manage.py migrate

## Rodar o banco 
- py manage.py runserver

## Criar Super Usuário
- python manage.py createsuperuser

## Abrir o Swagger da aplicação 
- Gerar o acesso no /api/token colocando usuario e senha criado do superusuario

## Autenticar o swagger 
- Clicar em autenticar 