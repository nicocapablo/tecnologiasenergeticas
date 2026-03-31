let currentQuestions = [];
let currentIndex = 0;
let errorsQueue = [];
let startTime;
const TIME_LIMIT = 30000; // 30 segundos para considerar que te ha costado

// Elementos del DOM
const questionEl = document.getElementById('question-text');
const optionsEl = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback-container');
const feedbackText = document.getElementById('feedback-text');
const counterEl = document.getElementById('counter');
const progressBar = document.getElementById('progress-bar');
const nextBtn = document.getElementById('next-btn');

// Inicializar la app
function init() {
    // Mezclar preguntas iniciales (bancoDePreguntas viene de preguntas.js)
    currentQuestions = [...bancoDePreguntas].sort(() => Math.random() - 0.5);
    showQuestion();
}

function showQuestion() {
    const q = currentQuestions[currentIndex];
    questionEl.innerText = q.texto;
    optionsEl.innerHTML = '';
    feedbackEl.classList.add('hidden');
    
    // Actualizar progreso
    const progress = (currentIndex / currentQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    counterEl.innerText = `Pregunta ${currentIndex + 1} de ${currentQuestions.length}`;

    // Crear botones de opciones
    q.opciones.forEach(opcion => {
        const letra = opcion.split(')')[0].trim().toLowerCase();
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = opcion;
        btn.onclick = () => checkAnswer(letra, btn);
        optionsEl.appendChild(btn);
    });

    startTime = Date.now(); // Empezar a contar tiempo
}

function checkAnswer(selected, btn) {
    const q = currentQuestions[currentIndex];
    const endTime = Date.now();
    const duration = endTime - startTime;
    const allBtns = document.querySelectorAll('.option-btn');
    
    // Desactivar botones para que no cambie la respuesta
    allBtns.forEach(b => b.disabled = true);

    if (selected === q.correcta) {
        btn.classList.add('correct');
        // Si ha tardado mucho, la añadimos al final para reforzar aunque haya acertado
        if (duration > TIME_LIMIT) {
            feedbackText.innerHTML = `<p style="color:orange"><b>¡Bien, pero lento!</b> Has tardado mucho, así que la repetiremos al final.</p>${q.feedback}`;
            errorsQueue.push(q);
        } else {
            feedbackText.innerHTML = `<p style="color:green"><b>¡Correcto!</b></p>${q.feedback}`;
        }
    } else {
        btn.classList.add('wrong');
        // Mostrar cuál era la correcta
        allBtns.forEach(b => {
            const letra = b.innerHTML.split(')')[0].trim().toLowerCase();
            if (letra === q.correcta) b.classList.add('correct');
        });
        
        feedbackText.innerHTML = `<p style="color:red"><b>Fallo.</b> Revisa la explicación para aprender el concepto:</p>${q.feedback}`;
        
        // LÓGICA DE MEMORIA: Añadir a la cola de errores
        // Se inserta 5 posiciones más adelante o al final si quedan pocas
        const retryIndex = Math.min(currentIndex + 5, currentQuestions.length);
        currentQuestions.splice(retryIndex, 0, q); 
    }

    feedbackEl.classList.remove('hidden');
    
    // Renderizar fórmulas de MathJax si las hay
    if (window.MathJax) {
        MathJax.typesetPromise();
    }
}

nextBtn.onclick = () => {
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
        showQuestion();
    } else {
        showSummary();
    }
};

function showSummary() {
    questionEl.innerText = "¡Sesión completada!";
    optionsEl.innerHTML = `<p>Has terminado todas las preguntas y sus refuerzos. ¡Buen trabajo!</p>`;
    feedbackEl.classList.add('hidden');
    progressBar.style.width = `100%`;
}

// Arrancar al cargar
window.onload = init;
