const containerInput = document.getElementById('form-input');
const containerBtn = document.getElementById('form-btn');
const listaDiarias = document.getElementById('list-diarias')
const listasDiarias = document.getElementById('list-diarias');
const listasFuturas = document.getElementById('list-futuras');
const listasRealizadas = document.getElementById('list-futuras');


const navButtons = document.querySelectorAll('.container__nav-btn');
const views = document.querySelectorAll('.container__view');

let tasks = [];

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

    if (taskText === '') return;

    const newtask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        view:'diarias'
    };

    tasks.push(newtask);

    containerInput.value = '';
    containerInput.focus();

    renderTasks();
    console.log("lista de tareas actuales : ", tasks);
    
});

const renderTasks = () =>{
    listaDiarias.textContent = '';
    listasFuturas.textContent = '';
    listasRealizadas.textContent = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('container__section-item');
        li.textContent = task.text;

        if (task.view === 'diarias') {
            listaDiarias.appendChild(li);
        } else if (task.view === 'futuras') {
            listasFuturas.appendChild(li);
        } else if(task.view === 'realizadas'){
            listasRealizadas.appendChild(li)
        }
    });

}