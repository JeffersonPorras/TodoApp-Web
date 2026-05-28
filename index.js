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
        
        const taskTextSpan = document.createElement('span');
        taskTextSpan.textContent = task.text;
        li.appendChild(taskTextSpan);

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

        

        if (task.fechaVencimiento) {
            const dateBadge = document.createElement('span');
            dateBadge.classList.add('task-date-badge');

            const [ano, mes, dia] = task.fechaVencimiento.split('-');
            dateBadge.textContent = `⏳ ${dia}/${mes}`;
            li.appendChild(dateBadge);
            
        };
        
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

}

const eliminarTareaPorId = (idRecibido) =>{
    tasks = tasks.filter(task => task.id !== idRecibido);
    guardarEnLocalStorage();
    renderTasks();
}

const completarTareaPorId = (idRecibido) =>{
    tasks = tasks.map(task => {
        if (task.id === idRecibido) {
            return {
                ...task,
                completed:true,
                view:'realizadas'
            };
        }
        
        return task;
    });
    guardarEnLocalStorage();
    renderTasks();    
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

verificarYReinicarTareas();
renderTasks();