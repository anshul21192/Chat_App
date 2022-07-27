const socket = io();

// Elements

const messagevalue = document.querySelector('input');
const messageform = document.querySelector('#messageform');
const submit_button = document.querySelector('#submit');
const send_location_button = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');


// Templates

const message_template = document.querySelector('#message-template').innerHTML;
const locationmessage_template = document.querySelector('#locationmessage-template').innerHTML;
const sidebar_template=document.querySelector('#sidebar-template').innerHTML;


// options

const {username , room} = Qs.parse(location.search , {ignoreQueryPrefix:true});


socket.on('message',(message)=>{
    console.log(message);

    const html = Mustache.render(message_template , {
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a'),
        username:message.username
    });
    $messages.insertAdjacentHTML('beforeend' , html);
});

socket.on('locationmessage',(url)=>{
    console.log(url);

    const html = Mustache.render(locationmessage_template,{
        url:url.url,
        createdAt:moment(url.createdAt).format('hh:mm a'),
        username:url.username
    });

    $messages.insertAdjacentHTML('beforeend' , html);

});

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebar_template , {
        room ,
        users
    });
    document.querySelector('#sidebar').innerHTML=html;
})

submit_button.addEventListener('click',(e)=>{
    e.preventDefault();

    submit_button.setAttribute('disabled' ,'disabled');

    // disable/
    const message=messagevalue.value;
    socket.emit('sendmessage' , message, (msg)=>{
        // console.log(msg);
        submit_button.removeAttribute('disabled');
        messagevalue.value = '';
        messagevalue.focus();
    });

    // Enable....


});


send_location_button.addEventListener('click' , ()=>{
    if(!navigator.geolocation) return alert('Geolocation is not supported in your browser');

    send_location_button.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendlocation' , {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },(msg)=>{
            console.log(msg);
            send_location_button.removeAttribute('disabled');
        });
    });
});

socket.emit('join' , {username, room} , (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});