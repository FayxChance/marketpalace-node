
var socket = io('https://marketpalace.azurewebsites.net/');

function deliveryCost() {
    var weight = parseFloat(document.getElementById('weight').value);
    var distance = parseFloat(document.getElementById('distance').value);
    var deliveryCostValue=0;
    socket.emit('deliveryCostRequest',{weight:weight,distance:distance});
    socket.on("deliveryCostResponse", (response)=> {
        deliveryCostValue = response['deliveryCost'];
        console.log(deliveryCostValue);
    });
}