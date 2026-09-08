# Tom de base

Mede a cor da pele pela câmera, sugere o tom de base compatível e acompanha a aplicação em tempo real, avisando onde falta, onde está desigual e quando o rosto começa a descolar do pescoço.

A leitura é colorimétrica, não estimada por modelo de linguagem: conversão para CIELAB, classificação por ITA° e comparação por ΔE2000. Roda inteiramente no navegador — nenhum frame do rosto sai do dispositivo.

**Demonstração:** `https://SEU-USUARIO.github.io/tom-de-base/`

## Arquivos

```
.
├── index.html      protótipo completo, arquivo único
├── README.md
├── LICENSE         MIT
├── .gitignore
└── .nojekyll       impede o Jekyll do GitHub Pages de processar os arquivos
```

Sem build, sem bundler, sem `npm install`. As dependências vêm de CDN:

- [`@mediapipe/tasks-vision`](https://www.npmjs.com/package/@mediapipe/tasks-vision) 0.10.14 — malha facial
- Modelo `face_landmarker.task` do storage público do Google

---

## Subindo no GitHub

**1. Crie o repositório.** Em github.com, botão **New**. Nome `tom-de-base`, visibilidade pública (o GitHub Pages gratuito exige repositório público). Não marque nenhuma opção de inicialização — nem README, nem .gitignore, nem licença, já estão aqui.

**2. Suba os arquivos.** No terminal, dentro desta pasta:

```bash
git init
git add .
git commit -m "Leitura de tom de pele e guia de aplicação de base"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/tom-de-base.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub — o que aparece na URL do seu perfil. Se o GitHub pedir senha, ele quer um **personal access token**, não a senha da conta: Settings → Developer settings → Tokens (classic) → Generate new token, escopo `repo`.

**3. Ative o GitHub Pages.** No repositório: **Settings → Pages**. Em *Source*, escolha **Deploy from a branch**. Branch `main`, pasta `/ (root)`. Salve.

**4. Aguarde um ou dois minutos.** O endereço aparece no topo da mesma página.

**5. Atualize o link** da seção *Demonstração* deste README com o endereço real.

---

## Testando

### A regra que governa tudo

A API de câmera do navegador só funciona em **contexto seguro**:

| Origem | Câmera funciona |
|---|---|
| `file:///Users/voce/index.html` | não |
| `http://localhost:8000` | sim |
| `http://192.168.0.15:8000` | não |
| `https://qualquer-dominio` | sim |

Abrir o arquivo com duplo clique **não funciona** — a permissão nunca chega a ser pedida.

### No computador

```bash
cd tom-de-base
python3 -m http.server 8000
```

Abra `http://localhost:8000`. Chrome dá o melhor resultado por causa do delegate de GPU do MediaPipe.

### No celular

Depois de publicar no GitHub Pages, basta abrir a URL. Se quiser testar antes:

```bash
brew install cloudflared
cloudflared tunnel --url http://localhost:8000
```

Devolve uma URL `https://` pública. O computador precisa continuar ligado. No iOS não há alternativa: Safari exige HTTPS real.

---

## Como usar

### Preparação, que vale mais que o software

**Luz.** Perto de uma janela, luz de dia indireta. Sem lâmpada amarela, sem parede colorida a menos de um metro refletindo no rosto, sem janela às suas costas. Uma parede laranja próxima muda a medida inteira.

**Rosto.** Sem maquiagem, cabelo preso liberando testa e mandíbula.

**Referência.** Uma folha de papel branco à mão.

### Passo a passo

1. Abra a página e permita o acesso à câmera.
2. **Confira o espelho.** Segure algo escrito na frente da câmera. Como esta é uma visão de espelho, o texto deve aparecer **invertido**. Se estiver legível, alterne o botão no cartão *Câmera*. Isso não é cosmético — a orientação errada troca a bochecha direita pela esquerda nas instruções.
3. **Calibre.** Segure a folha branca cobrindo o miolo do quadro e clique em **Calibrar com papel branco**. Sem isso os números são relativos: o balanço de branco automático da câmera desloca todas as leituras.
4. Enquadre o rosto. Quatro círculos brancos marcam as regiões amostradas, e um quinto aparece no pescoço.
5. Leia o painel: L\*, a\*, b\*, classificação por ITA°, subtom e tom sugerido.

**O teste que vale mais que o número** está no bloco do topo: pele medida e base alvo encostadas sem divisória. Se a aresta entre as duas metades some ao olhar, o tom bate. Se você enxerga a linha, não bate. Juxtaposição de aresta dura é o método mais confiável de julgamento de cor que existe, e aqui é mais confiável que o ΔE.

Para testar outro tom, clique em qualquer quadrado da escala. **Voltar para a sugestão automática** restaura a leitura.

### Acompanhando a aplicação

1. Ainda com o rosto limpo, clique em **Marcar pele nua**. Isso captura a linha de base.
2. Ligue **Instruções por voz** — suas mãos vão estar ocupadas.
3. Aplique a base normalmente.

As barras enchem por região conforme a cor caminha da pele nua até o tom alvo. As instruções cobrem três situações:

- **Cobertura baixa.** Indica a região mais atrasada.
- **Desigualdade.** Diferença acima de 32% entre a região mais coberta e a menos coberta.
- **Descolamento do pescoço.** ΔE acima de 5,5 entre a média do rosto e o pescoço. É o erro mais comum na aplicação real e o que praticamente nenhuma ferramenta mede.

---

## Como funciona

### Medição

1. Quatro regiões faciais (testa, duas bochechas, queixo) mais uma extrapolada abaixo do queixo, no pescoço.
2. Em cada mancha, **média aparada**: descarta os 25% de pixels mais claros e os 25% mais escuros. Remove brilho de oleosidade, fio de cabelo e sombra sem precisar de segmentação.
3. Conversão sRGB → linear → XYZ D65 → CIELAB.
4. **ITA°** = atan((L\*−50)/b\*) × 180/π, com a classificação usada em dermatologia e cosmética: muito clara acima de 55°, clara até 41°, intermediária até 28°, morena até 10°, castanha até −30°, escura abaixo disso.
5. Subtom pelo ângulo de matiz em a\*b\*: frio abaixo de 47,5°, neutro até 57,5°, quente acima.
6. Tom sugerido por menor **ΔE2000** contra o catálogo.

Como referência de leitura do ΔE: abaixo de 2,5 a diferença é dificilmente perceptível, entre 2,5 e 5 é visível a olho treinado, acima de 5 é visível para qualquer pessoa.

### Orientação da imagem

Existe um único ponto onde o espelhamento é resolvido, e ele importa mais aqui do que pareceria.

O quadro cru é convertido uma vez para a **orientação real** — não espelhada. A medição consome esse quadro, porque os índices da malha do MediaPipe são anatômicos: o índice 50 é a bochecha direita da pessoa apenas se a imagem estiver na orientação verdadeira. Numa imagem espelhada o modelo continua encontrando um rosto válido e continua rotulando, só que trocado, e o guia passaria a mandar você esfumar o lado errado sem nenhum sinal de erro.

A **exibição** espelha esse quadro de volta, sempre, porque a pessoa se maquia olhando para a tela como quem olha para um espelho.

O botão no cartão *Câmera* informa apenas se a fonte já chega espelhada. Webcam frontal costuma chegar; câmera traseira de celular, não. O app tenta deduzir pelo `facingMode` da faixa de vídeo e assume espelhado quando essa informação não vem, que é o caso comum em webcam de notebook.

### O catálogo é genérico

Os 36 tons embutidos são gerados por matiz e luminosidade, não medidos de produtos reais. Estão marcados como referência na própria interface. Para virar produto, substitua em `SHADES` pelos valores L\*a\*b\* dos produtos da marca, medidos com colorímetro ou espectrofotômetro. Essa é a única parte que não dá para gerar com honestidade.

```js
SHADES.push({ id:'N30', tone:'neutro', L:62, a:9.6, b:12.3, css:labToRgb(62,9.6,12.3) });
```

---

## Problemas comuns

**A câmera não abre.** Você abriu por `file://`. Sirva por `localhost` ou publique em HTTPS.

**As instruções mandam esfumar o lado errado.** O espelho está invertido. Faça o teste do texto no cartão *Câmera*.

**As leituras pulam durante a aplicação.** Você mudou de posição em relação à luz. É limitação real de câmera, não bug. Fique parado em relação à janela.

**O tom sugerido muda sozinho.** Mesma causa. Recalibre e refaça a leitura sem se mover.

**O mesmo rosto dá tons diferentes em cômodos diferentes.** Esperado sem travar exposição. É a principal limitação do protótipo.

**A voz não sai.** O navegador exige interação do usuário antes de liberar áudio. Clique em qualquer lugar da página e ligue de novo.

---

## Limitações conhecidas

**Balanço de branco.** A câmera ajusta cor automaticamente e desloca a medida inteira. Sem a calibração com papel branco, os valores são relativos e não comparáveis entre ambientes. Travar exposição e temperatura exige `applyConstraints` e só funciona de forma confiável no Chrome Android.

**Iluminação.** Luz quente, parede colorida próxima ou contraluz invalidam a leitura. Janela com luz indireta é o cenário de referência.

**Oclusão.** Mão e pincel cobrem o rosto durante a aplicação e o rastreio oscila. Não há retenção de última pose válida implementada.

**Catálogo genérico.** Sem medição real dos produtos, a sugestão indica a faixa correta, não o SKU correto.

**Aparelhos antigos.** Sem delegate de GPU o quadro cai bastante.

## O teste que decide se isso vira produto

Meça o mesmo rosto em três iluminações — janela, lâmpada quente, LED de teto — com e sem calibração, e anote os L\*. A dispersão entre elas é o número que define a tolerância que o produto precisa ter, e é a primeira pergunta que um cliente de cosmético vai fazer.

Reduzir essa dispersão passa por travar exposição, ISO e temperatura de cor, ou, o caminho mais robusto e usado na indústria, por exigir um alvo de referência colorimétrico no quadro.

## Próximos passos

- Catálogo real medido com colorímetro
- Retenção de pose sob oclusão de mão e pincel
- Trava de exposição e temperatura via `applyConstraints`
- Camada de linguagem gerando as instruções a partir das métricas, no lugar das frases fixas atuais
- Ficha exportável com a leitura e o tom recomendado, para o cliente levar à loja

## Licença

MIT. Veja [LICENSE](LICENSE).
