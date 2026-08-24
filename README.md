# CursorVetoLight / MoldeLab Light

Versao leve do editor web de moldes vetoriais, preparada para ser publicada como
arquivos estaticos no Cloudflare Workers Free.

## Diferencas desta versao

- O editor, nesting, importadores e exportadores continuam no navegador.
- A digitalizacao `scikit-image` roda localmente em um Web Worker com Pyodide.
- Fotos de moldes nao precisam ser enviadas a um servidor Python.
- Nao ha dependencia de AWS Bedrock, EC2, Render, Flask ou container.
- Login SaaS, banco compartilhado, scanner remoto por celular e assistente de IA
  ficam fora desta versao light.

## Digitalizacao com scikit-image

Ao escolher **Digitalizacao > scikit-image > Auto digitalizar**, o navegador
carrega Python, NumPy, Pillow e scikit-image sob demanda. O primeiro uso pode
demorar mais; os arquivos ficam no cache do navegador para os usos seguintes.

O processamento ocorre em segundo plano para nao travar a interface. O algoritmo:

1. reduz imagens grandes;
2. converte para tons de cinza;
3. calcula o limiar de Otsu;
4. remove ruido e fecha pequenas falhas;
5. encontra o maior componente conectado;
6. extrai e simplifica o contorno para pontos editaveis.

## Desenvolvimento

Requisitos: Node.js 18 ou superior e pnpm.

```bash
pnpm install
pnpm run build
pnpm run dev
```

O build final fica em `dist/`.

## Publicacao no Cloudflare

Autentique o Wrangler uma vez e publique:

```bash
pnpm run deploy
```

O arquivo `wrangler.jsonc` publica `dist/` como Static Assets. O processamento
pesado permanece no computador do usuario, evitando o limite de CPU do Workers
Free.

## Privacidade

No modo scikit-image, a foto selecionada e processada dentro do navegador. O
aplicativo carrega o runtime e os pacotes cientificos do CDN oficial do Pyodide,
mas nao envia a foto para esse CDN.

## Origem

Derivado de [vladicho/cursorveto](https://github.com/vladicho/cursorveto) para
experimentacao e distribuicao no Cloudflare Free.

