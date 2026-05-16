
const createTitle = (value) =>{
     
    const title = document.createElement('h1');
    title.textContent = value;    
    return document.body.appendChild(title);
} 


createTitle("My Todo List")