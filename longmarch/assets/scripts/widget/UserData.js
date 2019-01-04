cc.Class({
    extends: cc.Component,

    properties: {
        value_number: Number,
        value_string: String,
        value_object: null
    },

    getNumber(){
        return this.value_number;
    },

    setNumber(number){
        this.value_number = number;
    },

    getString(){
        return this.value_string;
    },

    setString(str){
        this.value_string = str;
    },

    getObject(){
        return this.value_object;
    },

    setObject(obj){
        this.value_object = obj;
    }
});