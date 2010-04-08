
// ************************************************************************
// ************************************************************************
// ** 
// **  CC+
// **

YAHOO.cc.plus.show_info = function (more_permissions) {
    document.getElementById('more-container').innerHTML = more_permissions;
    document.getElementById('more-container').setAttribute("class", "license more");
}