const themeToggleBtn = document.getElementById('theme-toggle');

const navButtons = document.querySelectorAll('.container__nav-btn');
const views = document.querySelectorAll('.container__view');

const containerInput = document.getElementById('form-input');
const containerBtn = document.getElementById('form-btn');
const containerSelect = document.getElementById('form-select');

const listasDiarias = document.getElementById('list-diarias');
const listasFuturas = document.getElementById('list-futuras');
const listasRealizadas = document.getElementById('list-realizadas');

let tasks = JSON.parse(localStorage.getItem('cyberTasks')) || [];

navButtons.forEach(button =>{
    button.addEventListener('click', () => {
        navButtons.forEach(btn => btn.classList.remove('container__nav-btn--active'));
        button.classList.add('container__nav-btn--active');

        const targetView = button.getAttribute('data-view');  

        if (targetView === 'estadisticas') {
            actualizarPanelEstadisticas();
        }

        views.forEach(view =>{
            if (view.id ===`view-${targetView}`) {
                view.classList.remove('container__view--hidden');
            } else {
                view.classList.add('container__view--hidden');
            }
        });
    });
});

containerBtn.addEventListener('click', () =>{
    const taskText = containerInput.value.trim();

    const destinoSeleccionado = containerSelect.value;

    if (taskText === '') return;

    const newtask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        view: destinoSeleccionado,
        origin: destinoSeleccionado
    };

    tasks.push(newtask);
    containerInput.value = '';
    containerInput.focus();
    guardarEnLocalStorage();
    renderTasks();
});

const renderTasks = () =>{
    listasDiarias.textContent = '';
    listasFuturas.textContent = '';
    listasRealizadas.textContent = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('container__section-item');

        const taskContentContainer = document.createElement('div');
        taskContentContainer.classList.add('container__task-content');
        
        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        taskContentContainer.appendChild(taskTextSpan);

         if (task.fechaVencimiento) {
            const dateBadge = document.createElement('span');
            dateBadge.classList.add('task-date-badge');

            const fechaObj = new Date (task.fechaVencimiento);
            fechaObj.setDate(fechaObj.getDate() + 1);

            const dia = String(fechaObj.getDate()).padStart(2, '0');
            const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
            
            dateBadge.textContent = `⏳ ${dia}/${mes}`;
            taskContentContainer.appendChild(dateBadge);
        };

        li.appendChild(taskContentContainer);

        const btnContainer = document.createElement('div');
        btnContainer.classList.add('container__item-actions');


        if (task.view === 'futuras' || task.fechaVencimiento) {
            const dateBtn = document.createElement('button');
            dateBtn.classList.add('container__btn-action', 'date-btn');
            dateBtn.innerHTML = `
            🗓️ 
            <input type="date" class="task-date-input date-input" value="${task.fechaVencimiento || ''}">
        `;

        const dateInput = dateBtn.querySelector('.task-date-input');
        dateInput.addEventListener('change', (e) =>{
            const nuevaFecha = e.target.value;

            tasks = tasks.map(t => {
                if (t.id === task.id) {
                    return {...t, fechaVencimiento: nuevaFecha};
                }
                return t;
            });

            guardarEnLocalStorage();
            renderTasks();
        });

        btnContainer.appendChild(dateBtn);
        }
        
        const completeBtn = document.createElement('button');
        completeBtn.classList.add('container__btn-action', 'container__btn-check');
        completeBtn.textContent = '✔';
        completeBtn.addEventListener('click', () => completarTareaPorId(task.id));


        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('container__btn-action', 'container__btn-delete');
        deleteBtn.textContent = '❌';
        deleteBtn.addEventListener('click', () => eliminarTareaPorId(task.id));


        btnContainer.appendChild(completeBtn);
        btnContainer.appendChild(deleteBtn);
        
        li.appendChild(btnContainer);

        if (task.view === 'diarias') {
            listasDiarias.appendChild(li);
        } else if (task.view === 'futuras') {
            listasFuturas.appendChild(li);
        } else if(task.view === 'realizadas'){
            listasRealizadas.appendChild(li)
        } 
    });
    actualizarPanelEstadisticas();

}

const eliminarTareaPorId = (idRecibido) =>{
    tasks = tasks.filter(task => task.id !== idRecibido);
    guardarEnLocalStorage();
    renderTasks();
}

const completarTareaPorId = (id) =>{

    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes = String(hoy.getMonth()).padStart(2, '0');
    const ano = hoy.getFullYear();
    const fechaHoySting = `${ano}-${mes}-${dia}`;


    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed:true,
                view:'realizadas',
                fechaCompletado: fechaHoySting
            };
        }
        
        return task;
    });
    guardarEnLocalStorage();
    renderTasks();    
}

const verificarFechasProximas = () =>{
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    tasks.forEach(task =>{
        if (task.fechaVencimiento && task.fechaVencimiento.trim() !== '' && !task.completed) {
            const fechaObj = new Date(task.fechaVencimiento)
            
            if (isNaN(fechaObj.getTime())) return;

            fechaObj.setHours(0, 0, 0, 0);
            fechaObj.setDate(fechaObj.getDate() + 1);

            const diferenciaTiempo = fechaObj - hoy;
            const diferenciaDias = Math.round(diferenciaTiempo / (1000 * 60 * 60 *24));

            if (diferenciaDias === 1 || diferenciaDias === 2) {
                const yaNotificadoHoy = sessionStorage.getItem(`notificado-${task.id}`);

                if (!yaNotificadoHoy) {
                    new Notification("¡Alerta el Futuro ⏳",{
                        body: `Tu tarea "${task.text}" está a solo ${diferenciaDias} dia(s) de vencer`,
                        icon: "Assest/icon.png",
                        tag: `Vencimiento-${task.id}`
                    });
                    sessionStorage.setItem(`notificado-${task.id}`, 'true');
                }
            
            }
        }
    });
}

const actualizarPanelEstadisticas = () =>{
    const txtContadorAnual = document.getElementById('stats-anual-count');
    const txtMensajeMotivacional = document.getElementById('stats-motivational-msg');

    if (!txtContadorAnual) return;
    
    const anoActual = new Date().getFullYear();

    const metasLogradasEsteAno = tasks.filter(task =>{
        if (task.completed && task.origin === 'futuras' && task.fechaCompletado) {
            return task.fechaCompletado.startWith(`${anoActual}`);
        }
        return false;
    });

    const totalMetas = metasLogradasEsteAno.length;
    txtContadorAnual.textContent = totalMetas < 10 ? `0${totalMetas}` : totalMetas;

    if (totalMetas === 0) {
        txtMensajeMotivacional.textContent = "[SISTEMA]: sin registros de mestas este año. Inicia una misión futura.";
    } else if (totalMetas > 0 && totalMetas <= 5) {
        txtMensajeMotivacional.textContent = "⚡ [SISTEMA EN MARCHA]: Núcleo activo. Estás contruyendo tu camino.";
    } else if (totalMetas > 5 && totalMetas <= 15) {
        txtMensajeMotivacional.textContent = "🚀 [PRODUCTIVIDAD ALTA]: Rediseñando el futuro. Gran Progreso!!!.";
    }else{
        txtMensajeMotivacional.textContent = "🔥 [ESTADO: DIOS DE LA RED]: has roto los limites establecidos este Año.";
    }

}


const guardarEnLocalStorage = () =>{
    localStorage.setItem('cyberTasks', JSON.stringify(tasks))
}

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggleBtn.textContent = '☀️';
}

themeToggleBtn.addEventListener('click', () =>{
    document.body.classList.toggle('light-mode');

    if (document.body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        themeToggleBtn.textContent = '🌙'
    } else {
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️'
    }
});

const verificarYReinicarTareas = () =>{
    const hoy = new Date().toLocaleDateString('en-CO');
    const ultimaFecha = localStorage.getItem('ultimaFechaControl');

    if (ultimaFecha && ultimaFecha !==  hoy) {
        tasks = tasks.map(task =>{
            if (task.origin === 'diarias' && task.completed === true) {
                return{
                    ...task,
                    completed: false,
                    view: 'diarias'
                };
            }
            return task;
        });
        guardarEnLocalStorage();
        renderTasks();
    }
    localStorage.setItem('ultimaFechaControl', hoy);
}

const solicitarPermisosNotificaciones = () =>{
    if ('Notification' in window) {
        Notification.requestPermission().then(permiso => {
            if (permiso === 'granted') {
                console.log(('sistemas de alerta de la PWA autoriados! 🚀'));
            }
        })
    }

}




verificarYReinicarTareas();
solicitarPermisosNotificaciones();
verificarFechasProximas();
renderTasks();