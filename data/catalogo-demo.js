// ─── DADOS DEMONSTRATIVOS — JUANA COSMÉTICOS ─────────────────────────────────
// Marca, produtos, preços e serviços fictícios, criados para um projeto de portfólio.
//
// Este arquivo é a fonte única dos dados de demonstração:
//  • index.html usa estes dados quando o Firebase não está configurado
//    (ou quando uma coleção do Firestore está vazia ou indisponível);
//  • extras/firebase/seed-firebase.html envia estes mesmos dados ao Firestore.
// ─────────────────────────────────────────────────────────────────────────────
const CATALOGO_DEMO = {
  loja: {
    nomeLoja: "Juana Cosméticos",
    slogan: "Sua beleza, seu momento.",
    segmento: "Beleza e cosméticos",
    cidade: "Registro/SP",
    instagram: "@juana.cosmeticos",
    telefone: "(13) 91999999",
    // WhatsApp desativado: o telefone demonstrativo está incompleto (celular tem 9 dígitos após o DDD).
    // Preencha com DDI + DDD + número (ex.: 5513912345678) apenas quando houver um número real e validado.
    whatsapp: "",
    bannerUrl: "",
    corPrimaria: "#DFA6AC",   // rosé — detalhes, bordas e selos
    corSecundaria: "#7E4C50", // vinho — botões, links e destaques de texto
    corDestaque: "#F2DEDF",   // rosé claro — fundos suaves
  },

  categorias: [
    { id: "skincare", nome: "Skincare", icone: "fa-spa", ordem: 1 },
    { id: "maquiagem", nome: "Maquiagem", icone: "fa-wand-magic-sparkles", ordem: 2 },
    { id: "cabelos-e-corpo", nome: "Cabelos e corpo", icone: "fa-pump-soap", ordem: 3 },
  ],

  produtos: [
    // Skincare
    {
      id: 1, categoria: "skincare", nome: "Sérum Facial Glow C", preco: 59.9, destaque: true,
      imagem: "./assets/produtos/serum-glow-c.svg",
      descricao: "Sérum de textura leve com vitamina C para a rotina da manhã.",
      detalhes: "Fórmula fluida, de rápida absorção, pensada para compor a rotina diária de cuidados com o rosto. Pode ser usado antes do hidratante e do protetor solar.",
      modoDeUso: "Aplique de 3 a 4 gotas no rosto limpo e seco, pela manhã. Finalize com hidratante e protetor solar.",
    },
    {
      id: 2, categoria: "skincare", nome: "Hidratante Soft Skin", preco: 44.9,
      imagem: "./assets/produtos/hidratante-soft-skin.svg",
      descricao: "Hidratante facial de toque seco para o uso diário.",
      detalhes: "Creme leve que espalha com facilidade e deixa a pele com sensação de maciez. Combina com a rotina da manhã e da noite.",
      modoDeUso: "Aplique sobre o rosto e o pescoço limpos, com movimentos suaves de baixo para cima.",
    },
    {
      id: 3, categoria: "skincare", nome: "Gel de Limpeza Fresh", preco: 34.9,
      imagem: "./assets/produtos/gel-limpeza-fresh.svg",
      descricao: "Gel de limpeza facial com sensação refrescante.",
      detalhes: "Textura em gel que forma uma espuma leve para a limpeza diária do rosto, de manhã e à noite.",
      modoDeUso: "Umedeça o rosto, massageie uma pequena quantidade com as pontas dos dedos e enxágue com água.",
    },
    {
      id: 4, categoria: "skincare", nome: "Água Micelar Pure", preco: 29.9,
      imagem: "./assets/produtos/agua-micelar-pure.svg",
      descricao: "Água micelar para limpar a pele e remover a maquiagem.",
      detalhes: "Solução prática para o fim do dia: remove a maquiagem e limpa a pele em um único passo, sem necessidade de enxágue.",
      modoDeUso: "Umedeça um disco de algodão e passe suavemente pelo rosto, pelos olhos e pelos lábios.",
    },

    // Maquiagem
    {
      id: 5, categoria: "maquiagem", nome: "Base Líquida Natural", preco: 49.9,
      imagem: "./assets/produtos/base-liquida-natural.svg",
      descricao: "Base líquida de acabamento natural para o dia a dia.",
      detalhes: "Cobertura leve a média, que pode ser construída em camadas, com acabamento natural.",
      modoDeUso: "Aplique pequenas quantidades e espalhe com pincel, esponja ou os dedos, do centro do rosto para fora.",
    },
    {
      id: 6, categoria: "maquiagem", nome: "Batom Matte Velvet", preco: 24.9, destaque: true,
      imagem: "./assets/produtos/batom-matte-velvet.svg",
      descricao: "Batom de acabamento matte com toque aveludado.",
      detalhes: "Cor intensa e textura cremosa no momento da aplicação, que seca com acabamento matte.",
      modoDeUso: "Contorne os lábios a partir do centro e preencha. Para mais intensidade, aplique uma segunda camada.",
    },
    {
      id: 7, categoria: "maquiagem", nome: "Paleta Nude Collection", preco: 69.9,
      imagem: "./assets/produtos/paleta-nude-collection.svg",
      descricao: "Paleta de sombras em tons nude, com acabamentos matte e cintilante.",
      detalhes: "Tons neutros que combinam entre si para criar desde maquiagens leves até produções para a noite.",
      modoDeUso: "Use os tons claros para iluminar, os médios no côncavo e os escuros para dar profundidade ao olhar.",
    },
    {
      id: 8, categoria: "maquiagem", nome: "Gloss Shine Lips", preco: 19.9,
      imagem: "./assets/produtos/gloss-shine-lips.svg",
      descricao: "Gloss labial de brilho intenso e textura confortável.",
      detalhes: "Pode ser usado sozinho, para um brilho delicado, ou por cima do batom.",
      modoDeUso: "Aplique com o aplicador sobre os lábios, sozinho ou sobre o batom.",
    },

    // Cabelos e corpo
    {
      id: 9, categoria: "cabelos-e-corpo", nome: "Kit Capilar Essencial", preco: 59.9,
      imagem: "./assets/produtos/kit-capilar-essencial.svg",
      descricao: "Kit com shampoo e condicionador para a rotina dos cabelos.",
      detalhes: "Dupla pensada para a lavagem do dia a dia, com fragrância suave. Prática para presentear ou começar uma rotina de cuidados.",
      modoDeUso: "Aplique o shampoo nos cabelos molhados, massageie e enxágue. Depois, aplique o condicionador no comprimento e nas pontas e enxágue.",
    },
    {
      id: 10, categoria: "cabelos-e-corpo", nome: "Máscara Nutri Hair", preco: 39.9,
      imagem: "./assets/produtos/mascara-nutri-hair.svg",
      descricao: "Máscara capilar cremosa para o cuidado semanal.",
      detalhes: "Textura cremosa que envolve os fios e facilita o desembaraço. Complementa a rotina de shampoo e condicionador.",
      modoDeUso: "Após o shampoo, aplique mecha a mecha no comprimento e nas pontas. Deixe agir por alguns minutos e enxágue.",
    },
    {
      id: 11, categoria: "cabelos-e-corpo", nome: "Body Splash Rosé", preco: 42.9, destaque: true,
      imagem: "./assets/produtos/body-splash-rose.svg",
      descricao: "Body splash com fragrância floral e delicada.",
      detalhes: "Perfume leve para o corpo, com notas florais, para usar a qualquer momento do dia.",
      modoDeUso: "Borrife sobre a pele limpa e seca, a cerca de 15 cm de distância.",
    },
    {
      id: 12, categoria: "cabelos-e-corpo", nome: "Loção Corporal Soft Touch", preco: 32.9,
      imagem: "./assets/produtos/locao-corporal-soft-touch.svg",
      descricao: "Loção hidratante corporal de rápida absorção.",
      detalhes: "Textura leve que espalha com facilidade e deixa a pele com toque macio e perfume suave.",
      modoDeUso: "Aplique sobre a pele após o banho, massageando até a completa absorção.",
    },
  ],

  servicos: [
    {
      id: "consultoria-de-beleza", ordem: 1, icone: "fa-comments",
      nome: "Consultoria de beleza", preco: 0, rotuloPreco: "Gratuita",
      descricao: "Uma conversa para entender a sua rotina e indicar produtos do catálogo que combinam com você.",
    },
    {
      id: "maquiagem-express", ordem: 2, icone: "fa-wand-magic-sparkles",
      nome: "Maquiagem express", preco: 60,
      descricao: "Maquiagem rápida para o dia a dia, um compromisso ou um encontro especial.",
    },
    {
      id: "design-de-sobrancelhas", ordem: 3, icone: "fa-eye",
      nome: "Design de sobrancelhas", preco: 35,
      descricao: "Modelagem das sobrancelhas respeitando o formato natural do seu rosto.",
    },
    {
      id: "kit-presente", ordem: 4, icone: "fa-gift",
      nome: "Montagem de kit presente", preco: 49.9, aPartirDe: true,
      descricao: "Kits montados com produtos do catálogo e embalagem para presente.",
    },
    {
      id: "aula-de-automaquiagem", ordem: 5, icone: "fa-chalkboard-user",
      nome: "Aula de automaquiagem", preco: 90,
      descricao: "Aula prática para aprender técnicas de maquiagem usando os seus próprios produtos.",
    },
  ],

  cupons: [
    { codigo: "JUANA10", tipo: "percentual", valor: 10, valorMinimo: 0, validade: null, ativo: true },
  ],
};
