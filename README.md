# Futsal Ace

Crie um aplicativo web responsivo chamado provisoriamente de Futsal Scout, voltado para treinadores, preparadores físicos e comissões técnicas de equipes de futsal.

O principal objetivo do sistema é permitir que o treinador registre, em tempo real, tudo o que acontece com cada atleta durante uma partida usando um tablet. Após o jogo, o aplicativo deve transformar os registros técnicos, táticos e físicos em relatórios individuais e coletivos, gráficos de desempenho e recomendações automáticas de treinamento.

O aplicativo deve ter aparência profissional, moderna, esportiva e tecnológica, com experiência otimizada principalmente para tablets.

1. Dashboard principal

Criar um dashboard com:

Próxima partida

Últimas partidas analisadas

Quantidade de atletas cadastrados

Média de desempenho da equipe

Alertas de atletas com queda de desempenho

Atletas em evolução

Indicadores físicos gerais

Últimos relatórios gerados

Adicionar gráficos rápidos mostrando:

desempenho técnico médio;

intensidade física;

eficiência ofensiva;

eficiência defensiva;

evolução dos atletas ao longo das últimas partidas.

2. Cadastro da equipe

Permitir cadastrar:

Nome da equipe
Categoria
Temporada
Treinador
Auxiliar técnico
Preparador físico

Adicionar possibilidade de cadastrar mais de uma equipe dentro da mesma conta.

Exemplo:

Sub-11
Sub-13
Sub-15
Sub-17
Adulto

3. Cadastro dos atletas

Criar uma tela simples e rápida para cadastro dos jogadores.

Campos:

Nome do atleta
Foto
Número da camisa
Posição
Pé dominante
Data de nascimento
Altura
Peso

Posições possíveis:

Goleiro
Fixo
Ala direita
Ala esquerda
Pivô

Adicionar também informações físicas:

Peso
Altura
Frequência cardíaca média
Frequência cardíaca máxima
Velocidade máxima
Distância média percorrida por partida

Criar um perfil individual para cada atleta.

4. Cadastro da partida

Antes de iniciar o Scout, o treinador deverá criar uma partida.

Campos:

Adversário
Data
Horário
Competição
Local
Categoria
Tipo de partida

Casa ou fora.

Depois selecionar quais atletas foram relacionados para a partida.

Definir:

Titulares
Reservas
Goleiros

Adicionar botão:

INICIAR PARTIDA

5. Tela principal do Scout

Esta deve ser a tela mais importante do aplicativo.

Ela deve ser especialmente desenvolvida para utilização em TABLET durante uma partida.

O treinador terá o tablet na mão e deverá conseguir registrar qualquer acontecimento utilizando apenas um ou dois toques.

Na parte superior mostrar:

Nome das equipes
Placar
Cronômetro
1º tempo / 2º tempo
Faltas coletivas
Botão pausar partida

Logo abaixo apresentar os jogadores.

Cada jogador deverá aparecer em formato de CARD grande.

Exemplo:

10 – João

Ao tocar no jogador, abrir rapidamente as opções de Scout.

6. Eventos individuais do Scout

Criar botões grandes e facilmente clicáveis.

Separar por categorias.

Ataque

Passe certo
Passe errado
Assistência
Chute a gol
Chute para fora
Chute bloqueado
Gol
Perda de bola
Drible certo
Drible errado

Defesa

Desarme
Interceptação
Bloqueio
Recuperação de bola
Erro defensivo
Gol sofrido por falha individual

Disciplina

Falta cometida
Falta sofrida
Cartão amarelo
Cartão vermelho

Outros

Roubo de bola
Erro de domínio
Finalização perigosa
Participação em jogada de gol

Cada clique deverá adicionar +1 ao indicador.

Exemplo:

Passe errado +1

O botão deve dar um feedback visual rápido indicando que o evento foi registrado.

Permitir também desfazer o último registro.

7. Substituições

Criar um sistema extremamente simples para registrar substituições.

Exemplo:

Selecionar jogador que sai.

Selecionar jogador que entra.

Registrar automaticamente:

Minuto da substituição
Tempo em quadra
Tempo no banco

Esses dados posteriormente farão parte dos indicadores físicos e de rendimento.

8. Cronologia da partida

Todos os eventos registrados devem possuir timestamp.

Exemplo:

03:24 – João – Passe errado
05:11 – Lucas – Desarme
06:42 – Pedro – Chute a gol
06:43 – Pedro – Gol
08:15 – João – Falta cometida

Criar uma timeline completa da partida.

Permitir editar ou excluir eventos registrados incorretamente.

9. Dados físicos através de relógio GPS

Cada jogador poderá utilizar um relógio esportivo ou dispositivo GPS durante a partida e os dados deverão posteriormente ser associados ao atleta.

Criar inicialmente uma área onde seja possível inserir manualmente ou importar os seguintes dados:

Distância percorrida
Velocidade média
Velocidade máxima
Frequência cardíaca média
Frequência cardíaca máxima
Número de sprints
Tempo em alta intensidade
Tempo em intensidade moderada
Tempo em baixa intensidade
Calorias estimadas

Preparar a arquitetura do sistema para futuras integrações através de API com dispositivos como:

Garmin
Polar
Apple Watch
Samsung Galaxy Watch
Catapult
STATSports

Não implementar integrações reais nesta primeira versão, apenas deixar o sistema preparado para essa evolução.

10. Finalizar partida

Criar um botão:

FINALIZAR PARTIDA

Após finalizar, o sistema deverá consolidar automaticamente todos os dados.

Gerar:

Relatório geral da equipe
Relatório individual dos atletas
Indicadores técnicos
Indicadores físicos
Indicadores disciplinares

11. Relatório geral da equipe

Apresentar dashboard visual contendo:

Total de passes certos
Total de passes errados
Aproveitamento de passes
Finalizações
Finalizações no gol
Gols
Desarmes
Interceptações
Perdas de bola
Faltas cometidas
Cartões

Gerar gráficos:

Gráfico de barras
Gráfico radar
Gráfico de pizza
Linha temporal da partida

12. Perfil de desempenho individual

Cada jogador deverá ter um relatório próprio.

Exemplo:

João – Camisa 10

Mostrar:

Minutos jogados
Gols
Assistências
Passes certos
Passes errados
Precisão de passes
Finalizações
Desarmes
Interceptações
Perdas de bola
Faltas
Cartões

Também mostrar dados físicos:

Distância percorrida
Velocidade máxima
Velocidade média
Frequência cardíaca média
Frequência máxima
Quantidade de sprints

13. Radar de competências

Criar um gráfico radar para cada atleta.

Indicadores:

Passe
Finalização
Defesa
Tomada de decisão
Disciplina
Intensidade
Velocidade
Resistência

O radar deverá ser construído automaticamente utilizando os dados acumulados das partidas.

14. Nota do atleta

Criar um sistema de pontuação automática de 0 a 10.

Exemplo:

Nota da partida: 7.8

A nota deverá considerar diferentes variáveis.

Exemplo:

Passes corretos aumentam a nota.

Passe errado reduz levemente.

Gol aumenta bastante.

Assistência aumenta.

Desarme aumenta.

Erro que gera gol adversário reduz.

Cartões reduzem.

O algoritmo poderá futuramente ser configurável pelo treinador.

15. Inteligência de desenvolvimento do atleta

Esta deve ser uma das principais funcionalidades do sistema.

O sistema deve analisar automaticamente os indicadores e identificar pontos fortes e pontos de melhoria.

Exemplo:

João – Camisa 10

Pontos fortes:

Boa capacidade de desarme
Alta intensidade física
Boa recuperação de bola

Pontos de melhoria:

Precisão de passes abaixo da média
Baixa eficiência nas finalizações

16. Recomendação automática de treinamento

Com base nos indicadores do atleta, o sistema deverá sugerir treinamentos específicos.

Exemplo:

Problema identificado:

Passe errado acima de 25%.

Recomendação:

Treinamento de passe curto sob pressão.

Sugestões:

Rondos 3x1
Passe em espaço reduzido
Passe de primeira
Tomada de decisão em superioridade numérica

Outro exemplo:

Problema:

Baixa eficiência nas finalizações.

Recomendação:

Treinamento específico de finalização.

Exercícios:

Finalização após domínio
Finalização de primeira
Chute após deslocamento lateral
Finalização sob pressão

Outro exemplo:

Problema:

Baixa quantidade de desarmes.

Recomendação:

Treinamento defensivo.

Exercícios:

1x1 defensivo
Cobertura
Antecipação
Pressão sobre portador da bola

17. Plano de Desenvolvimento Individual

Criar automaticamente um PDI esportivo para cada jogador.

Exemplo:

Plano de Desenvolvimento – João

Objetivo:

Melhorar precisão de passe.

Indicador atual:

72%

Meta:

85%

Prazo:

30 dias

Treinamentos recomendados:

2 sessões semanais de passe sob pressão.

O sistema deverá acompanhar automaticamente a evolução.

18. Evolução histórica

Criar gráficos mostrando a evolução do jogador.

Exemplo:

Últimas 10 partidas.

Passes corretos

72%
76%
79%
82%
85%

Mostrar tendência:

↑ Evolução

↓ Queda de desempenho

→ Estável

19. Comparação entre atletas

Permitir comparar dois ou mais atletas da mesma posição.

Exemplo:

João x Pedro

Comparar:

Passe
Finalização
Desarme
Velocidade
Resistência
Intensidade
Disciplina

Apresentar gráfico radar comparativo.

20. Inteligência da comissão técnica

Criar uma tela chamada:

Insights da Comissão Técnica

O sistema deverá gerar automaticamente análises como:

“João apresenta evolução consistente nos passes nas últimas quatro partidas.”

“Pedro apresenta queda de intensidade física no segundo tempo.”

“Lucas possui alto índice de recuperação de bola, mas baixa precisão no primeiro passe após o desarme.”

“Carlos percorre distância acima da média da equipe, porém apresenta queda de velocidade após 30 minutos.”

21. Heatmap futuro

Preparar espaço visual para futura implementação de mapa de calor da quadra.

Objetivo:

Mostrar onde cada jogador mais atuou.

Quadra de futsal vista de cima.

Regiões:

Defesa
Meio
Ataque
Lado esquerdo
Lado direito

22. Banco histórico do jogador

O perfil do atleta deverá guardar todo seu histórico.

Exemplo:

Número de partidas
Minutos jogados
Gols
Assistências
Passes
Finalizações
Desarmes
Cartões
Distância total percorrida
Velocidade máxima histórica

Permitir filtros:

Últimos 5 jogos
Últimos 10 jogos
Último mês
Temporada completa

23. Relatórios

Permitir gerar relatórios em PDF.

Tipos:

Relatório da partida
Relatório do atleta
Relatório físico
Relatório técnico
Relatório de evolução
Plano de Desenvolvimento Individual

Adicionar opção:

Compartilhar relatório com atleta

ou

Compartilhar com responsáveis, principalmente em categorias de base.

24. Design da aplicação

Criar uma identidade visual de software esportivo profissional.

Referências de sensação visual:

Performance esportiva
Tecnologia
Dados
Análise profissional

Interface limpa e moderna.

Usar:

Cards
Ícones esportivos
Dashboards
Gráficos
Indicadores numéricos grandes

No Scout ao vivo, priorizar botões GRANDES para facilitar o toque durante o jogo.

Evitar menus complexos durante a partida.

25. Navegação principal

Menu lateral:

Dashboard
Equipes
Atletas
Partidas
Scout ao Vivo
Relatórios
Desempenho
Treinamentos
PDI dos Atletas
Configurações

26. Banco de dados

Estruturar entidades como:

users
teams
athletes
matches
match_players
match_events
physical_data
athlete_statistics
training_recommendations
athlete_development_plans

Cada evento deverá conter:

match_id
athlete_id
event_type
timestamp
period

27. Regra mais importante de UX

O registro durante uma partida precisa ser EXTREMAMENTE rápido.

Fluxo ideal:

Selecionar atleta → selecionar acontecimento.

No máximo dois toques.

Exemplo:

João → Passe errado

O sistema registra imediatamente:

Jogador
Evento
Tempo da partida
Período

O treinador não pode precisar preencher formulários durante o jogo.

28. Tela Scout em modo tablet

Criar especificamente uma tela em landscape para tablets.

Exemplo de estrutura:

Topo:

PLACAR | CRONÔMETRO | PERÍODO

Abaixo:

cards dos atletas em quadra.

Ao selecionar um atleta, abrir lateralmente ou em modal uma matriz de ações:

PASSE CERTO
PASSE ERRADO
DESARME
PERDA DE BOLA
CHUTE
GOL
FALTA
CARTÃO

Usar botões grandes e contraste alto.

29. Visão do produto

O aplicativo não deverá funcionar apenas como um contador de estatísticas.

A proposta principal é transformar:

DADOS → DIAGNÓSTICO → TREINAMENTO → EVOLUÇÃO

O sistema coleta dados durante partidas.

Depois transforma os dados em indicadores.

Os indicadores identificam fragilidades.

As fragilidades geram recomendações de treinamento.

Os novos jogos verificam se o atleta evoluiu.

Criar a experiência visual do produto destacando esse conceito.

30. Protótipo funcional

Criar inicialmente dados fictícios para demonstração.

Equipe:

Futsal Academy Sub-15

Jogadores:

10 – João
7 – Lucas
8 – Pedro
5 – Gabriel
1 – Rafael

Criar uma partida fictícia já preenchida para demonstrar os dashboards e relatórios.

Também criar uma partida ainda não iniciada para permitir testar o Scout ao vivo.

Quero que todas as telas sejam navegáveis e visualmente completas, mesmo que os dados inicialmente sejam simulados.

O foco desta primeira versão é criar um MVP visual e funcional que demonstre claramente o potencial comercial do produto.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://futsal-insights.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f654473d-514b-48f5-91c4-fe4a8e37f23e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
