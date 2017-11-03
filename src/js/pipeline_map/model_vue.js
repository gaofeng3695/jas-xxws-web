/**
 * 参数说明
 *<modal-vue v-if="netshow" :styleobj="styleobj"  :footer="aFooters" @click1="createSave" @click2="cancel">
 *styleobj:打开模态框的样式{title: '标题',width: '宽度800(不需要单位)',height: '高度',}
 :footer="aFooters"下面按钮的样式[{ "title": "新建", "bgcolor": "#59b6fc","color":"按钮字体显示的颜色", "disabled": false }, { "title": "取消", "color": "#fff", "disabled": false }, ];
 后面的click1,click2依次写入  和前面的按钮相匹配上
 */

// 实现列表组件展示
Vue.component('modal-vue', {
    props: {
        styleobj: {
            type: Object,
        },
        footer: {
            type: Array,
        }
    },
    template: [
        '<div class="forms"><div v-bind:style="whstyle"><div class="modal_table" >',
        '<modal-top :title="styleobj.title" @click1="click2"></modal-top>',
        '<div class="content"  v-bind:style="height">',
        '<div class="tablevue">',
        '<slot>',
        '</slot>',
        '</div>',
        '</div>',
        '<modal-footer :footer="footer"  @click1="click1" @click2="click2" v-if="footer"></modal-footer>',
        '</div>',
        '</div>',
        '</div>',
    ].join(" "),
    methods: {
        click1: function() {
            this.$emit('click1', this.styleobj);
        },
        click2: function() {
            this.$emit('click2', this.styleobj);
        }
    },
    computed: {
        whstyle: function() {
            return {
                width: this.styleobj.width + "px",
                height: this.styleobj.height + "px",
                margin: "40px auto 10px auto",
            }
        },
        height: function() {
            return {
                height: (this.styleobj.height - 106) + "px",
            }
        },
    }
});


Vue.component('modal-top', {
    props: {
        title: {
            type: String,
        }
    },
    template: [
        '<div class="top">',
        '<span class="htitle" v-text="title"></span>',
        '<span class="closes fa fa-close "  @click="click1"></span>',
        '</div>',
    ].join(" "),
    methods: {
        click1: function() {
            this.$emit('click1');
        },
    },
});
Vue.component('modal-footer', {
    props: {
        footer: {
            type: Array,
        }
    },
    template: [
        '<div class="footer">',
        '<button class="btns "  v-for="item,index in footer" @click="clickbtn($event.currentTarget,item,index)" :style=[{background:item.bgcolor,color:item.color}]>{{item.title}}</button>',
        '</div>',
    ].join(" "),
    data: function() {
        return {
            style: {

            }
        };
    },
    methods: {
        clickbtn: function(dom, item, index) {
            var that = this;
            if (that.footer[index].disabled) {
                return;
            }
            if (that.footer[index].title == "取消" || that.footer[index].title == "关闭") {
                that.$emit('click2');
                return
            }
            that.$emit('click' + (index + 1));
        }
    },
});
Vue.component('input-vue', {
    props: {
        title: {
            type: String,
        },
        required: {
            type: Boolean,
        },
        name: {
            type: String,
        },
        inputobj: {
            type: Object,
        },
        placeholder: {
            type: String
        }
    },
    template: [
        '<div class="form_list"><div class="list_left text-right">',
        '<i v-if="required">*</i><span >{{title}}</span>',
        '</div>',
        '<div class="list_right">',
        '<input type="text" :placeholder="placeholder" class="form-control" :name="name" v-model="inputobj[name]">',
        '</div></div>',
    ].join(" "),
});
Vue.component('input-two-vue', {
    props: {
        title: {
            type: String,
        },
        name: {
            type: String,
        },
        inputobj: {
            type: Object,
        },
        required: {
            type: Boolean,
        },
        placeholder: {
            type: String
        }
    },
    template: [
        '<div class="form_part" >',
        '<div class="list_left">',
        '<i v-if="required">*</i>{{title}}</div>',
        '<div class="list_right">',
        '<input type="text"  :placeholder="placeholder" class="form-control" :name="name" v-model="inputobj[name]">',
        '</div>',
        '</div>',
    ].join(" "),
    mounted: function() {

    },

});


Vue.component('textarea-vue', {
    props: {
        title: {
            type: String,
        },
        name: {
            type: String,
        },
        inputobj: {
            type: Object,
        },
        placeholder: {
            type: String
        }
    },
    template: [
        '<div class="form_list"><div class="list_left text-right">',
        '{{title}}',
        '</div>',
        '<div class="list_right textarea_text">',
        '<textarea maxlength="200" :name="name" :placeholder="placeholder" class="form-control textcontent" v-model="inputobj[name]" v-on:input="checkLen()"></textarea>',
        '<span class="text_num">（200字）</span>',
        '</div></div>',
    ].join(" "),
    methods: {
        checkLen: function() {
            var len = this.inputobj[this.name].length;
            if (len > 199) {
                $(".textcontent").val(this.inputobj[this.name].substring(0, 200));
            }
            var num = 200 - len;
            if (num < 0) {
                num = 0;
            }
            $(".text_num").text('(' + num + '字)');
        }
    }
});
Vue.component('textarea-view-vue', {
    props: {
        title: {
            type: String,
        },
        text: {
            type: String,
        },

    },
    template: [
        '<div class="detail"><div class="list_left text-right details_textarea_title">',
        '{{title}}',
        '</div>',
        '<div class="list_right textarea_text  textarea_view">',
        '<span class=" hLine remark" v-text="text"></span>',
        '</div></div>',
    ].join(" "),
});

Vue.component('span-vue', {
    props: {
        title: {
            type: String,
        },

        text: {
            type: String,
        }
    },
    template: [
        '<div><div class="list_left text-right details_title">',
        '<span >{{title}}</span>',
        '</div>',
        '<div class="list_right details_text ">',
        '<span class="umlin100" v-text="text"></span>',
        '</div></div>',
    ].join(" "),
});
Vue.component('span-two-vue', {
    props: {
        title: {
            type: String,
        },
        required: {
            type: Boolean,
        },
        text: {
            type: String
        }
    },
    template: [
        '<div class="form_part" >',
        '<div class="list_left details_title">',
        '<i v-if="required">*</i>{{title}}</div>',
        '<div class="list_right details_text">',
        '<span  class=" umlin100" v-text="text"></span>',
        '</div>',
        '</div>',
    ].join(" "),
});
Vue.component('select-vue', {
    props: {
        title: {
            type: String,
        },
        required: {
            type: Boolean,
        },
        optiondata: {
            type: Array,
        },
        name: {
            type: String,
        },
        inputobj: {
            type: Object,
        },
    },
    template: [
        '<div class="form_part" >',
        '<div class="list_left">',
        '<i v-if="required">*</i>{{title}}</div>',
        '<div class="list_right">',
        '<select  class="form-control" :style="fontcolr" v-model="inputobj[name]"><option v-for="data in optiondata" :value="data.code" >{{data.value}}</option></select>',
        '</div>',
        '</div>',

    ].join(" "),
    computed: {
        fontcolr: function() {
            if (!this.inputobj[this.name]) {
                return {
                    color: "#999"
                }
            }
        }
    }

});