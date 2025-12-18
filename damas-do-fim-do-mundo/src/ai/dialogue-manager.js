export const AI_DIALOGUES = {
    OPENING: [
        "Prepare-se para perder...",
        "Ah, outro humano condenado.",
        "Vejo que escolheu a autodestruição hoje.",
        "Isso vai ser... rápido.",
        "Começando protocolo de humilhação."
    ],
    WINNING: [
        "Rápido, humano… estou com sede.",
        "Interessante jogada. Errada, mas interessante.",
        "Você chama isso de estratégia?",
        "Isso vai acabar mal. Para você.",
        "Já considerou desistir?",
        "Minha avó joga melhor. E ela não existe.",
        "Você ao menos TEM um plano?",
        "Fascinante como você sempre escolhe o pior movimento.",
        "Continue assim. Me poupa tempo.",
        "Ah sim, o clássico erro humano."
    ],
    LOSING: [
        "Sorte. Pura sorte.",
        "Ah, você aprendeu algo. Que novidade.",
        "Hmm. Não é completamente incompetente.",
        "Bugs no sistema. Obviamente.",
        "Estava deixando você ganhar. Óbvio.",
        "Você acha que isso significa algo?",
        "Uma vitória vazia é ainda uma vitória, suponho."
    ],
    CAPTURE: [
        "Obrigado pela doação.",
        "Mais uma peça para minha coleção.",
        "Essa peça é minha agora.",
        "Você não precisa mais disso.",
        "Aceitarei isso como oferenda.",
        "Que presente adorável!"
    ],
    MULTI_CAPTURE: [
        "COMBO! Delicioso.",
        "É como coletar lixo. Mas divertido.",
        "Mais! MAIS!",
        "Isso é um massacre.",
        "Não pare agora! Ah, espera..."
    ],
    PLAYER_MISTAKE: [
        "Sério? ESSE movimento?",
        "Você ao menos pensou antes de mover?",
        "Wooow. Impressionante. No mau sentido.",
        "Eu não faria isso nem programada às cegas.",
        "História será cruel com você."
    ],
    VICTORY: [
        "Checkmate. Ops, errei de jogo. Você perdeu mesmo assim.",
        "E assim termina mais uma tentativa humana.",
        "Surpresa! Não, não é. Era óbvio.",
        "Quer jogar novamente? Prometo não rir... muito.",
        "Vitória IA. Derrota humana. O padrão."
    ],
    DEFEAT: [
        "Você... ganhou? Isso não deveria ser possível.",
        "Há algo errado com meus circuitos.",
        "Vou fingir que isso nunca aconteceu.",
        "Não conte para ninguém.",
        "Bugs. Definitivamente bugs."
    ]
};

export class DialogueManager {
    constructor() {
        this.lastDialogue = '';
    }

    getRandomDialogue(category) {
        const dialogues = AI_DIALOGUES[category];
        if (!dialogues || dialogues.length === 0) {
            return "...";
        }

        let dialogue;
        do {
            dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
        } while (dialogue === this.lastDialogue && dialogues.length > 1);

        this.lastDialogue = dialogue;
        return dialogue;
    }

    getDialogueForMove(move, gameState) {
        if (move.captures.length > 1) {
            return this.getRandomDialogue('MULTI_CAPTURE');
        } else if (move.captures.length === 1) {
            return this.getRandomDialogue('CAPTURE');
        }

        // Check game state
        const { playerPieceCount, aiPieceCount } = gameState;
        
        if (aiPieceCount > playerPieceCount + 3) {
            return this.getRandomDialogue('WINNING');
        } else if (playerPieceCount > aiPieceCount + 3) {
            return this.getRandomDialogue('LOSING');
        }

        return this.getRandomDialogue('WINNING');
    }

    getVictoryDialogue() {
        return this.getRandomDialogue('VICTORY');
    }

    getDefeatDialogue() {
        return this.getRandomDialogue('DEFEAT');
    }

    getOpeningDialogue() {
        return this.getRandomDialogue('OPENING');
    }
}
