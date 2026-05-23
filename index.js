const navButtons = document.querySelectorAll('.container__nav-btn');
const views = document.querySelectorAll('.container__view');

const containerInput = document.getElementById('form-input');
const containerBtn = document.getElementById('form-btn');

const listasDiarias = document.getElementById('list-diarias');
const listasFuturas = document.getElementById('list-futuras');
const listasRealizadas = document.getElementById('list-realizadas');

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

        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('container__item-actions');

        if (!task.completed) {
            const completeBtn = document.createElement('button');
            completeBtn.textContent = '✔️'
            completeBtn.classList.add('container__btn-action')
            
            completeBtn.addEventListener('click',() =>{
                completarTareaPorId(task.id);
        });
        actionsContainer.appendChild(completeBtn);
        };


        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '❌';
        deleteBtn.classList.add('container__btn-action', 'container__btn-action--delete');

        deleteBtn.addEventListener('click', () =>{
            eliminarTareaPorId(task.id)
        })

        actionsContainer.appendChild(deleteBtn);

        li.appendChild(actionsContainer);
        

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
    })
    renderTasks();    
}