const containerInput = document.getElementById('form-input');
const containerBtn = document.getElementById('form-btn');
const listaDiarias = document.getElementById('list-diarias')


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

    console.log("lista de tareas actuales : ", tasks);
    
})