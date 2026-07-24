const themeToggleBtn = document.getElementById('theme-toggle');
const navButtons = document.querySelectorAll('.container__nav-btn');
const views = document.querySelectorAll('.container__view');

const formContainer = document.getElementById('todo-form-container');
const containerInput = document.getElementById('form-input');
const containerBtn = document.getElementById('form-btn');

const listasDiarias = document.getElementById('list-diarias');
const listasFuturas = document.getElementById('list-futuras');
const listasRealizadas = document.getElementById('list-realizadas');

const cyberModal = document.getElementById('cyber-modal');
const cyberModalMsg = document.getElementById('cyber-modal-msg');
const modalBtnCancel = document.getElementById('modal-btn-cancel');
const modalBtnConfirm = document.getElementById('modal-btn-confirm');

let tasks = JSON.parse(localStorage.getItem('cyberTasks')) || [];
let vistaActual = 'diarias';
let filtroRealizadasActivo = 'todas';
let idTareaAEliminarTemporal = null;

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

    const opciones = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const hoyLocal = new Date().toLocaleDateString('es-CO', opciones);

    const [dia, mes, ano] = hoyLocal.split('/');
    const fechaFormateadaLocal = `${ano}-${mes}-${dia}`;

    const newtask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        view: vistaActual,
        origin: vistaActual,
        fechaCreacion: fechaFormateadaLocal,
        esRutina: vistaActual === 'diarias' ? true : false
    };

    tasks.push(newtask);
    guardarEnLocalStorage();
    renderTasks();
    containerInput.value = '';
    containerInput.focus();
});

const ordenarYAgruparPorFecha = (listasDiarias, propiedadFecha) => {
    const grupos = {};
    listasDiarias.forEach(task =>{
        const fecha = task[propiedadFecha] ? task[propiedadFecha] : 'Sin fecha';
        if (!grupos[fecha]) {
            grupos[fecha] = [];
        }
        grupos[fecha].push(task);
    });
    return grupos;
};

const crearContenedorBloqueCronologico = (fecha, tituloPrefijo) =>{
    const bloqueContainer = document.createElement('div');
    bloqueContainer.classList.add('cronograma-bloque');

    let fechaFormateada = fecha;
    if (fecha.includes('-')) {
        const partes = fecha.split('-')
        fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    const encabezado = document.createElement('div');
    encabezado.classList.add('cronograma-header');
    encabezado.textContent = `${tituloPrefijo}: [${fechaFormateada}]`;
    bloqueContainer.appendChild(encabezado);

    const ulInterna = document.createElement('ul');
    ulInterna.classList.add('cronograma-lista');
    bloqueContainer.appendChild(ulInterna);

    return { bloqueContainer, ulInterna};
}


const renderTasks = () =>{
    listasDiarias.textContent = '';
    listasFuturas.textContent = '';
    listasRealizadas.textContent = '';

    tasks.forEach(task => {
        if (!task.completed && task.view === 'diarias') {
            const li = crearElementoDOMTarea(task);
            listasDiarias.appendChild(li);
        }
    });

    const futurasPendientes = tasks.filter(task => !task.completed && task.view === 'futuras');
    const futurasAgrupadas = ordenarYAgruparPorFecha(futurasPendientes, 'fechaVencimiento');

    Object.keys(futurasAgrupadas).sort().forEach(fecha => {
        const {bloqueContainer, ulInterna} = crearContenedorBloqueCronologico(fecha, '//MISION_FUTURA');

        futurasAgrupadas[fecha].forEach(task => {
            const li = crearElementoDOMTarea(task);
            ulInterna.appendChild(li);
        });
        listasFuturas.appendChild(bloqueContainer);
    });

    const realizadasFiltradas = tasks.filter(task => task.completed || task.fechaCompletado);

    const realizadasConFiltro = realizadasFiltradas.filter(task => {
        if (filtroRealizadasActivo === 'todas') return true;
        return task.origin === filtroRealizadasActivo;
    })

    const realizadasAgrupadas = ordenarYAgruparPorFecha(realizadasConFiltro, 'fechaCompletado');

    Object.keys(realizadasAgrupadas).sort().reverse().forEach(fecha => {
        const { bloqueContainer, ulInterna } = crearContenedorBloqueCronologico(fecha, '//STATUS_COMPLETADO')

        realizadasAgrupadas[fecha].forEach(task => {
            const li = crearElementoDOMTarea(task);
            ulInterna.appendChild(li);
        });

        listasRealizadas.appendChild(bloqueContainer);
    });

    const pestañaEstadisticasActiva = document.querySelector('.container__nav-btn[data-view="estadisticas"]');
    if (pestañaEstadisticasActiva && pestañaEstadisticasActiva.classList.contains('container__nav-btn--active')) {
        actualizarPanelEstadisticas();
    };       
}

const crearElementoDOMTarea = (task) =>{
        const li = document.createElement('li')
        li.classList.add('container__section-item');

        if (task.completed) {
            li.classList.add('container__section-item--completed');
        }

        const taskContentContainer = document.createElement('div');
        taskContentContainer.classList.add('container__task-content');

        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;

        if (task.completed && task.origin === 'diarias') {
            taskTextSpan.style.textDecoration = 'line-through';
            taskTextSpan.style.opacity = '0.6';
        }

        taskContentContainer.appendChild(taskTextSpan);

        if (task.fechaVencimiento) {
            const dateBadge = document.createElement('span');
            dateBadge.classList.add('task-date-bagde');

            const partes = task.fechaVencimiento.split('-');
            const ano = partes[0];
            const mes = partes[1];
            const dia = partes[2];

            dateBadge.textContent = `⏳ ${dia}/${mes}/${ano}`;
            taskContentContainer.appendChild(dateBadge);
        }

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
        if (!task.completed) {
            const completeBtn = document.createElement('button');
            completeBtn.classList.add('container__btn-action', 'container__btn-check');
            completeBtn.textContent = '✔';
            completeBtn.addEventListener('click', () => completarTareaPorId(task.id));
            btnContainer.appendChild(completeBtn);
        }
    
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('container__btn-action', 'container__btn-delete');
        deleteBtn.textContent = '❌';
        deleteBtn.addEventListener('click', () => eliminarTareaPorId(task.id));
        btnContainer.appendChild(deleteBtn);
    
        
        li.appendChild(btnContainer);
    
        return li;
}

const eliminarTareaPorId = (id) => {
    const tareaAEliminar = tasks.find(t => t.id === id);
    if (!tareaAEliminar) return;

    idTareaAEliminarTemporal = id;

    if (cyberModalMsg) {
        cyberModalMsg.textContent = `⚠️ ¿Seguro de que deseas eliminar la misión: "${tareaAEliminar.text}" de los registros?`;
    }

    if (cyberModal) {
        cyberModal.classList.remove('cyber-modal__hidden');
    }
};

// Evento CONFIRMAR
if (modalBtnConfirm) {
    modalBtnConfirm.addEventListener('click', () => {
        if (idTareaAEliminarTemporal !== null) {
            tasks = tasks.filter(task => task.id !== idTareaAEliminarTemporal);
            guardarEnLocalStorage();
            renderTasks();
            actualizarPanelEstadisticas();
        }

        idTareaAEliminarTemporal = null;
        if (cyberModal) cyberModal.classList.add('cyber-modal__hidden');
    });
}

// Evento CANCELAR
if (modalBtnCancel) {
    modalBtnCancel.addEventListener('click', () => {
        idTareaAEliminarTemporal = null;
        if (cyberModal) cyberModal.classList.add('cyber-modal__hidden');
    });
}

const completarTareaPorId = (id) =>{

    const opciones = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const hoyLocal = new Date().toLocaleDateString('es-CO', opciones);

    const [dia, mes, ano] = hoyLocal.split('/');
    const fechaHoyString = `${ano}-${mes}-${dia}`;


    tasks = tasks.map(task => {
        if (task.id === id) {
            return {
                ...task,
                completed:true,
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

    const diaSemanaActual = hoyObj.getDay();
    const distanciaAlLunes = diaSemanaActual === 0 ? 6 : diaSemanaActual - 1;

    const lunesActual = new Date(hoyObj);
    lunesActual.setDate(hoyObj.getDate() - distanciaAlLunes);

    for (let i = 0; i < 7; i++) {
        const d = new Date(lunesActual);
        d.setDate(lunesActual.getDate() + i);
        
        const anoLocal = d.getFullYear();
        const mesLocal = String(d.getMonth() + 1).padStart(2, '0');
        const diaLocal = String(d.getDate()).padStart(2, '0')
        const fechaStringLocal = `${anoLocal}-${mesLocal}-${diaLocal}`;


        const completadasEseDia = tasks.filter(t =>
            t.origin === 'diarias' &&
            t.fechaCompletado === fechaStringLocal
        ).length;

        conteoUltimos7Dias.push({
            label: nombresDias[d.getDay()],
            amount: completadasEseDia
        });
    }

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
   
    const opciones = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const hoyLocal = new Date().toLocaleDateString('es-CO', opciones);

    const [dia, mes, ano] = hoyLocal.split('/');
    const hoyFormateado = `${ano}-${mes}-${dia}`;

    const ultimaFecha = localStorage.getItem('ultimaFechaControl');

    if (ultimaFecha && ultimaFecha !==  hoyFormateado) {

        const misRutinasBase = [...new Set(
         tasks.filter(t => t.esRutina === true).map(t => t.text)
        )];

        
       tasks = tasks.map(task => {
        if (task.origin === 'diarias' && !task.completed && task.view === 'diarias') {
            return {...task, view: 'archivadas'};
        }
        return task;
       });
       

       misRutinasBase.forEach((texto, indice) => {
        const yaExisteHoy = tasks.some(t => t.origin === 'diarias' && t.text === texto && t.fechaCreacion === hoyFormateado);

        if (!yaExisteHoy) {
            const nuevaMision = {
                id: Date.now() + indice + Math.random(),
                text: texto,
                completed: false,
                view: 'diarias',
                origin: 'diarias',
                fechaCreacion : hoyFormateado,
                fechaCompletado: null,
                esRutina: true
            };
            tasks.push(nuevaMision);
        }
       });

        guardarEnLocalStorage();
        renderTasks();
    }
        localStorage.setItem('ultimaFechaControl', hoyFormateado);
};


const cambiarFiltroRealizadas = (nuevoFiltro) =>{
    filtroRealizadasActivo = nuevoFiltro;

    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('filter-btn--active'));
    const btnActivo = document.getElementById(`btn-filter-${nuevoFiltro}`);
    if(btnActivo) btnActivo.classList.add('filter-btn--active');

    renderTasks();
}

const verificarRecordatorioTarde = () =>{
    const ahora = new Date();
    const horaActual = ahora.getHours();

    if (horaActual >= 12 && horaActual < 23) {
        const misionesPendientes = tasks.some(task => task.origin === 'diarias' && !task.completed );

        if (misionesPendientes) {
            const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')}`;
            const yaNotificadoTarde = sessionStorage.getItem(`notificado-tarde-${hoy}`);

            if (!yaNotificadoTarde && 'Notification' in window && Notification.permission === 'granted') {
                
                const alertasCyberpunk = [
                    "¡Aún queda día por delante! Tienes algunas tareas diarias pendientes por completar. ¡Tú puedes!",
                    "Recordatorio de la tarde: No olvides revisar tu lista de misiones de hoy para cerrar el día con éxito.",
                    "¡Hola! Date un momento para tachar las tareas que ya realizaste hoy. ¡Mantén el ritmo!",
                    "Organiza tu cierre de día: Revisa las tareas diarias que te faltan por cumplir antes de que termine el día."
                ];

                const mensajeAleatorio = alertasCyberpunk[Math.floor(Math.random() * alertasCyberpunk.length)];

                new Notification("⚡Alerta de Rutina",{
                    body: mensajeAleatorio,
                    icon: "Assest/icon.png",
                    tag: `alerta-vespertina-${hoy}`
                });

                sessionStorage.setItem(`notificado-tarde-${hoy}`, 'true');
            
            }
        }
    }
}; 

const iniciaRecordatorioVespertino = () =>{
    verificarRecordatorioTarde();

    setInterval(verificarRecordatorioTarde, 300000);
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
renderTasks();
actualizarPanelEstadisticas();
solicitarPermisosNotificaciones();
verificarFechasProximas();
iniciaRecordatorioVespertino();