# Manual Smart POS — Infobrasil

Documentação interna estática, sem framework e pronta para uso local ou publicação na Vercel.

## Estrutura

```text
.
├── index.html
├── README.md
└── assets
    ├── css/styles.css
    ├── images/
    ├── js/manual.js
    └── video/demonstracao-smart-pos.mp4
```

## Executar localmente

O manual pode ser aberto diretamente pelo `index.html`. Para reproduzir a hospedagem, inicie um servidor HTTP local na pasta:

```powershell
python -m http.server 8080
```

Depois, acesse `http://localhost:8080`.

## Publicar na Vercel

1. Envie esta pasta ao repositório conectado ao projeto da Vercel.
2. Em **Framework Preset**, selecione **Other**.
3. Deixe **Build Command** vazio.
4. Use `.` como **Output Directory**, se solicitado.
5. Faça o deploy.

Configure autenticação ou restrição de acesso na hospedagem. A diretiva `noindex` evita indexação, mas não protege o conteúdo contra acesso não autorizado.
