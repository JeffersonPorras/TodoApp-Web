const themeToggleBtn = document.getElementById('theme-toggle');
const navButtons = document.querySelectorAll('.container__nav-btn');
const views = document.querySelectorAll('.container__view');

const formContainer = document.getElementById('todo-form-container');
const containerInput = document.getElementById('form-input');
const containerBtn = document.getElementById('form-btn');

const listasDiarias = document.getElementById('list-diarias');
const listasFuturas = document.getElementById('list-futuras');
const listasRealizadas = document.getElementById('list-realizadas');

let tasks = JSON.parse(localStorage.getItem('cyberTasks')) || [];
let vistaActual = 'diarias';
let filtroRealizadasActivo = 'todas';

navButtons.forEach(button =>{
    button.addEventListener('click', () => {
        navButtons.forEach(btn => btn.classList.remove('container__nav-btn--active'));
        button.classList.add('container__nav-btn--active');

        const targetView = button.getAttribute('data-view');  

        if (targetView === 'diarias' || targetView === 'futuras') {
            vistaActual = targetView;
        }

        if (targetView === 'estadisticas') {
            actualizarPanelEstadisticas();
        }

        if (formContainer) {
            if (targetView === 'realizadas' || targetView === 'estadisticas') {
                formContainer.style.display = 'none';
            } else {
                formContainer.style.display = 'flex';
            }
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
    

    if (taskText === '') return;

    const newtask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        view: vistaActual,
        origin: vistaActual,
        fechaCreacion: new Date().toISOString().split('T')[0]
    };

    tasks.push(newtask);
    guardarEnLocalStorage();
    renderTasks();
    containerInput.value = '';
    containerInput.focus();
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

            const partes = task.fechaVencimiento.split('-');
            const ano = partes[0];
            const mes = partes[1];
            const dia = partes[2];
            
            dateBadge.textContent = `⏳ ${dia}/${mes}/${ano}`;
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

            if (filtroRealizadasActivo === 'todas') {
                listasRealizadas.appendChild(li)
            }else if (task.origin === filtroRealizadasActivo) {
                listasRealizadas.appendChild(li);
            }
        } 
    });

    const pestañaEstadisticasActiva = document.querySelector('.container__nav-btn[data-view="estadisticas"]');
    if (pestañaEstadisticasActiva && pestañaEstadisticasActiva.classList.contains('container__nav-btn--active')) {
        actualizarPanelEstadisticas();
    }


}

const eliminarTareaPorId = (id) =>{
    tasks = tasks.filter(task => task.id !== id);
    guardarEnLocalStorage();
    renderTasks();
    actualizarPanelEstadisticas();
}

const completarTareaPorId = (id) =>{

    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0')
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const ano = hoy.getFullYear();
    const fechaHoyString = `${ano}-${mes}-${dia}`;


    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed:true,
                view:'realizadas',
                fechaCompletado: fechaHoyString
            };
        }
        
        return task;
    });
    guardarEnLocalStorage();
    renderTasks();   
    actualizarPanelEstadisticas();  
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
            fechaObj.setDate(fechaObj.getDate());

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
    const txtContadorAnual = document.getElementById('stats-annual-count');
    const txtMensajeMotivacional = document.getElementById('stats-motivational-msg');
    const txtResumenSemanal = document.getElementById('stats-weekly-summary');
    const gridDiasSemana = document.getElementById('weekly-days-grid');

    if (!gridDiasSemana) return;

    if (tasks.length === 0) {
        if (txtResumenSemanal) txtResumenSemanal.textContent = "> Monitoreo: Sin datos en la base. "
        if (txtContadorAnual) txtContadorAnual.textContent = "00";
        gridDiasSemana.innerHTML = '';
        return;
    };
    
    const hoyObj = new Date();
    const anoActual = hoyObj.getFullYear();

    const metasLogradasEsteAno = tasks.filter(t =>{
       return t.completed === true &&
        t.origin === 'futuras' && 
        t.fechaCompletado && 
        t.fechaCompletado.startsWith(anoActual.toString())
    });

    const totalMetas = metasLogradasEsteAno.length;
    if (txtContadorAnual) {
        txtContadorAnual.textContent = totalMetas < 10 ? `0${totalMetas}` : totalMetas;
    }

    if (txtMensajeMotivacional) {
        if (totalMetas === 0) {
        txtMensajeMotivacional.textContent = "[SISTEMA]: sin Misiones cumplidas este año.";
    }else if (totalMetas <= 5) {
        txtMensajeMotivacional.textContent = "⚡ [SISTEMA EN MARCHA]: Núcleo activo. Buen Progreso.";
    }else{
        txtMensajeMotivacional.textContent = "🔥 [ESTADO: DIOS DE LA RED]: Límites Superados.";
    }
}

    const nombresDias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    let conteoUltimos7Dias = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(hoyObj.getDate() - i);
        
        const anoLocal = d.getFullYear();
        const mesLocal = String(d.getMonth() + 1).padStart(2, '0');
        const diaLocal = String(d.getDate()).padStart(2, '0')
        const fechaStringLocal = `${anoLocal}-${mesLocal}-${diaLocal}`;


        const completadasEseDia = tasks.filter(t =>
            t.completed == true &&
            t.origin === 'diarias' &&
            t.fechaCompletado === fechaStringLocal
        ).length;

        conteoUltimos7Dias.push({
            label: nombresDias[d.getDay()],
            amount: completadasEseDia
        });
        
        const maxTarea = Math.max(...conteoUltimos7Dias.map(d => d.amount));
        gridDiasSemana.innerHTML = '';

        conteoUltimos7Dias.forEach(dia => {
            const col = document.createElement('div');
            col.classList.add('weekly-day-col');
        
            let objetivoDiario = Math.max(maxTarea, 5);
            let altura = (dia.amount / objetivoDiario) * 100;

            if (dia.amount === maxTarea && maxTarea > 0) col.classList.add('max-success'); 
        
            col.innerHTML = `
                <span style="font-size: 0.65rem; font-weight: bold; color: var(--neon-blue);">${dia.amount}</span>
                <div class="weekly-bar" style="height: ${Math.max(altura, 2)}%;"></div>
                <span class="weekly-day-label">${dia.label}</span>
            `;
            gridDiasSemana.appendChild(col);
        });

   if (txtResumenSemanal) {
        txtResumenSemanal.textContent = maxTarea === 0 
        ? "> Monitoreo de Red: Sin actividad diaria reciente."
        : `> Análisis: pico de rendimiento detectado.`;
   }

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
    const hoyObj = new Date();
    const dia = String(hoyObj.getDate()).padStart(2, '0')
    const mes = String(hoyObj.getMonth() + 1).padStart(2, '0');
    const ano = hoyObj.getFullYear();
    const hoyFormateado = `${ano}-${mes}-${dia}`;

    const ultimaFecha = localStorage.getItem('ultimaFechaControl');

    if (ultimaFecha && ultimaFecha !==  hoyFormateado) {

        const historialRealizadas = tasks.filter(task => task.origin === 'realizadas');

        const diariasNoCompletas = tasks.filter(task => task.origin === 'diarias' && task.completed === false);

        const clonesParaElNuevoDia = tasks
        .filter(task = task.origin === 'diarias' && task.completed === false)
        .map((task, index) =>{
            return {
                ...task,
                id: Date.now() + index,
                completed: false,
                view: 'diarias',
                fechaCompletado: null,
                fechaCreacion: hoyFormateado
            }
        })

        tasks = [...historialRealizadas, ...diariasNoCompletas, ...clonesParaElNuevoDia];

        guardarEnLocalStorage();
    }
    localStorage.setItem('ultimaFechaControl', hoyFormateado);
}

const cambiarFiltroRealizadas = (nuevoFiltro) =>{
    filtroRealizadasActivo = nuevoFiltro;

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('filter-btn--active'));
    const btnActivo = document.getElementById(`btn-filter-${nuevoFiltro}`);
    if(btnActivo) btnActivo.classList.add('filter-btn--active');

    renderTasks();
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
actualizarPanelEstadisticas();