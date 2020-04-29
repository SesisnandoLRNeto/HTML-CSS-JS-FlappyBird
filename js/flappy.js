function criarElemento(tagName, className){
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function Barreira(reversa = false){
    this.elem = criarElemento('div', 'barreira')//elemento criado para definir como se dispoe na tela

    const borda = criarElemento('div', 'borda')
    const corpo = criarElemento('div', 'corpo')

    this.elem.appendChild(reversa ? corpo : borda)//sao os canos e seus corpos
    this.elem.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`

}

function ParBarreiras(altura, abertura, x){
    this.elem = criarElemento('div', 'par-de-barreiras')
    
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elem.appendChild(this.superior.elem)
    this.elem.appendChild(this.inferior.elem)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior 

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elem.style.left.split('px')[0])//pegando o valor px convertido em inteiro
    this.setX = x => this.elem.style.left = `${x}px`
    this.getLargura = () => this.elem.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new parBarreiras(700, 200, 800)
// document.querySelector('[wm-flappy]').appendChild(b.elem)

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParBarreiras(altura, abertura, largura),
        new ParBarreiras(altura, abertura, largura + espaco),
        new ParBarreiras(altura, abertura, largura + espaco * 2),
        new ParBarreiras(altura, abertura, largura + espaco * 3)

    ]
    
    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando  o elemento sair da area do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if(cruzouMeio) notificarPonto()
        })
    }

}

function Passaro(alturaJogo){
    let voando = false

    this.elem = criarElemento('img', 'passaro')
    this.elem.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elem.style.bottom.split('px')[0])
    this.setY = y => this.elem.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMax = alturaJogo - this.elem.clientHeight //passaro nao chega a sumir

        if(novoY <= 0){
            this.setY(0)
        }
        else if(novoY >= alturaMax){
            this.setY(alturaMax)
        }
        else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso(){
    this.elem = criarElemento('span', 'progresso')
    this.atualizaPontos = pontos => {
        this.elem.innerHTML = pontos
    }
    this.atualizaPontos(0)
}

function EstaoSobrepostos(elemA, elemB){
    const a = elemA.getBoundingClientRect()//retangulo associados ao elem a
    const b = elemB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
    && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top 
    && b.top + b.height >= a.top

    return horizontal && vertical
}

function Colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(par => {
        if(!colidiu){
            const superior = par.superior.elem
            const inferior = par.inferior.elem

            colidiu = EstaoSobrepostos(passaro.elem, superior)||
            EstaoSobrepostos(passaro.elem, inferior)

        }
    })
    return colidiu
}

function FlappyBird(){
    let pontos = 0

    const areaJogo = document.querySelector('[wm-flappy]')
    const alturaJogo = areaJogo.clientHeight
    const larguraJogo = areaJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(alturaJogo, larguraJogo, 200, 400, 
        () => progresso.atualizaPontos(++pontos))
    const passaro = new Passaro(alturaJogo)

    areaJogo.appendChild(progresso.elem)
    areaJogo.appendChild(passaro.elem)
    barreiras.pares.forEach( par => areaJogo.appendChild(par.elem)) 

    this.start = () => {
        //loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(Colidiu(passaro, barreiras)){
                clearInterval(temporizador)
            }
        }, 20)
    }

}
new FlappyBird().start()
