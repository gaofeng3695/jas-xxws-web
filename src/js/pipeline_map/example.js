

var pipe_net_example = { //局部组件的命名使用下划线连接的形式
    template : '#pipe_net_example',
    methods : {
        clickit : function(){
            alert('i click it')
        }
    },
    created : function(){
        console.log('pipe_net_example created')
    },
    mounted : function() {
        console.log('pipe_net_example mounted')
    },
};

// var pipe_net2 = { //局部组件的命名使用下划线连接的形式
//     template : '#pipe_net',
//     created : function(){
//         console.log('pipe-net2 created')
//         },
//     mounted : function() {
//         console.log('pipe-net2 mounted')
//     },
// };