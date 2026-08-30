# desafio_grupo_16

Aplicativo mobile desenvolvido em Ionic + Angular para a disciplina de Programação para Dispositivos Móveis.

## Requisitos do ambiente

Antes de instalar as dependências, verifique se o seu ambiente possui:

- Node.js 20 LTS ou superior
- npm (geralmente vem junto com o Node.js)
- Git
- Android Studio com Android SDK instalado
- JDK 17 (necessário para compilar o projeto Android)

## Clonando o projeto

```bash
git clone git@github.com:brucesena/desafio_grupo_16.git
cd desafio_grupo_16
```

## Instalando as dependências

No diretório raiz do projeto, execute:

```bash
npm install
```

Esse comando instala todas as bibliotecas listadas no arquivo `package.json`, incluindo:

- Angular / Ionic
- Capacitor
- Supabase
- RxJS
- Ionicons


## Rodando o app em desenvolvimento

Para iniciar o projeto em modo de desenvolvimento:

```bash
npm start
```

## Build do app Android

Rodar o shelscript build-apk.sh que está na pasta raiz, para isso é preciso ter o android studio instalado


## NO Browser

Este App está disponível na web, usando o github pages coseguimos disponibilisar nosso projeto em https://brucesena.github.io/desafio_grupo_16

``` 



```

## Estrutura principal

- `src/` - código da aplicação
- `android/` - projeto nativo Android gerado pelo Capacitor
- `package.json` - dependências e scripts do projeto

## Observações

Este projeto utiliza:

- Ionic Framework
- Angular
- Capacitor
- Supabase para integração de dados