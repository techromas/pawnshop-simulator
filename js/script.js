onload  = function(){

    var output      = document.getElementById("output");
    var quantity    = document.getElementById("quantity");
    var button      = document.getElementById("make");
    var today       = new Date();
    var year        = document.getElementById("year");
    var month       = document.getElementById("month");
    var day         = document.getElementById("day");

    year.value      = today.getFullYear()-1988;
    month.value     = today.getMonth()+1;
    day.value       = today.getDate();

    button.addEventListener("click",function(){ //ボタンが押されたら実行する

        output.innerHTML    = "";                   //出力の初期化

        var size    = parseInt(quantity.value);     //問題数の取得
        /*
        var date    = new Date( parseInt(year.value)+1988,
                                parseInt(month.value)-1,
                                parseInt(day.value));
        */

        //var examination = new QuizSetter(today);

        var examination = new QuizSetter(parseInt(year.value)+1988,parseInt(month.value),parseInt(day.value));

        output.innerHTML    += examination.toString() + "<br><br>";
        
        output.innerHTML    += "問題数" + size + "<br>";

        //output.innerHTML    += examination.arraiesToString();     //配列の表示
        

        //tableの作成
        var table   = document.createElement("table");
        output.appendChild(table);
        var tHeader = table.insertRow(-1);
        var th0     = tHeader.insertCell(-1);
        var th1     = tHeader.insertCell(-1);
        var th2     = tHeader.insertCell(-1);
        var th3     = tHeader.insertCell(-1);
        th0.innerHTML   = "問題番号";
        th1.innerHTML   = "質札期限";
        th2.innerHTML   = "期限延長";
        th3.innerHTML   = "受け出し";

        for(i=0;i<size;i++){
            var quiz    = examination.getQuiz();
            var tBody   = table.insertRow(-1);
            var tb0     = tBody.insertCell(-1);
            var tb1     = tBody.insertCell(-1);
            var tb2     = tBody.insertCell(-1);
            var tb3     = tBody.insertCell(-1);
            tb0.innerHTML   = (i+1) + "問目";
            tb1.innerHTML   = quiz.date;
            tb2.innerHTML   = quiz.extension;
            tb3.innerHTML   = quiz.takeout;
        }
        
    });
}

/********** class QuizSetter **********/

//コンストラクタ
var QuizSetter  = function(year,month,day){
    this.today          = new SuzuyaDate(year,month,day);       //今日の日付
    this.arrayLength    = 128;                                  //配列の長さ(初期状態128)
    this.daysArray;                                             //日付を入れる配列
    this.typesArray;                                            //種類を入れる配列
    this.initArray();                                           //配列の中身をセット
}

QuizSetter.prototype.initArray  = function(){
    this.daysArray  = new Array(this.arrayLength);
    this.typesArray = new Array(this.arrayLength);
    this.daysArray[0]   = new SuzuyaDate(this.today.year,this.today.month+3,this.today.day);
    var type    = 0;
    this.typesArray[0]  = type;
    var typeFlag    = this.today.day;

    //流質日を決定
    var tmpDay      = this.today.day-14;
    if(tmpDay<1){
        var tmpMonth    = this.today.month-1;
        var tmpYear     = this.today.year;
        if(tmpMonth<1){
            tmpYear--;
        }
        var tmpMax      = this.today.maxDay(tmpYear,tmpMonth);
        tmpDay  += tmpMax;
    }
    var endFlag     = tmpDay;
    
    //配列を埋める
    for(i=1;i<this.daysArray.length;i++){
        this.daysArray[i]   = new SuzuyaDate(this.daysArray[i-1].year,
                                                this.daysArray[i-1].month,
                                                this.daysArray[i-1].day-1);
        this.typesArray[i]  = type;
        if(type<3){
            if(this.daysArray[i].day==typeFlag){
                type++;
            }
        }else if(type==3&&endFlag==this.daysArray[i].day){
            type++;
        }
    }
}

QuizSetter.prototype.toString   = function(){
    return "本日が" + this.today.toString() + "であるとしたときの問題です。";
}

QuizSetter.prototype.arraiesToString  = function(){
    var str = "";
    for(i=0;i<this.daysArray.length;i++){
        str += this.daysArray[i].toString() + "   " + this.typeToString(this.typesArray[i]) +"<br>";
    }
    return str;
}

QuizSetter.prototype.typeToString   = function(type){
    var str;
    switch(type){
        case 0:
            str = "期限の延長はできません。1ヵ月分の質料でお持ち帰りになることが出来ます。";
            break;
        case 1:
            str = "期限の延長はできません。2ヵ月分の質料でお持ち帰りになることが出来ます。";
            break;
        case 2:
            str = "2ヵ月の延長が可能です。3ヵ月分の質料でお持ち帰りになることが出来ます。";
            break;
        case 3:
            str = "2ヵ月か3ヵ月の延長が可能です。4ヵ月分の質料でお持ち帰りになることが出来ます。";
            break;
        default:
            str = "お品物が流質しております。";
            break;
    }
    return str;
}

QuizSetter.prototype.getQuiz    = function(){
    var cursor  = parseInt( Math.random() * this.daysArray.length);
    var tmpDate = this.daysArray[cursor];
    var tmpType = this.typesArray[cursor];
    var quiz    = new Quiz(tmpDate.toString(),this.getExtensionString(tmpType),this.getTakeoutString(tmpType));
    return quiz;
}

QuizSetter.prototype.getExtensionString = function(type){
    var str;
    switch(type){
        case 0:
            str = "不可";
            break;
        case 1:
            str = "不可";
            break;
        case 2:
            str = "2";
            break;
        case 3:
            str = "2or3";
            break;
        default:
            str = "流質";
            break;
    }
    return str;
}

QuizSetter.prototype.getTakeoutString   = function(type){
    var str;
    switch(type){
        case 0:
            str = "1";
            break;
        case 1:
            str = "2";
            break;
        case 2:
            str = "3";
            break;
        case 3:
            str = "4";
            break;
        default:
            str = "流質";
            break;
    }
    return str;
}

class Quiz{
    constructor(date,extension,takeout){
        this.date       = date;
        this.extension  = extension;
        this.takeout    = takeout;
    }

}

/********** class SuzuyaDate **********/

var SuzuyaDate  = function(year,month,day){
    this.year       = year;
    this.month      = month;
    this.day        = day;
    this.rewrite();
}

SuzuyaDate.prototype.toString   = function(){
    var dayStr  = this.day;
    if(this.day==32){
        dayStr  = "末";
    }else if(this.day>this.maxDay(this.year,this.month)){
        dayStr  += "(" + this.maxDay(this.year,this.month) + ")";
    }
    return "平成" + (this.year-1988) + "年" + this.month + "月" + dayStr + "日";
}

SuzuyaDate.prototype.rewrite    = function(){
    while(this.day>32){
        this.day    -= 32;
        this.month++;
    }
    while(this.day<1){
        this.day    += 32;
        this.month--;
    }
    while(this.month>12){
        this.month  -= 12;
        this.year++;
    }
    while(this.month<1){
        this.month  += 12;
        this.year--;
    }
}

SuzuyaDate.prototype.maxDay = function(year,month){
    switch(month){
        case 4:
        case 6:
        case 9:
        case 11:
            return 30;
            break;
        case 2:
            if(year%4>0){
                return 28;
            }else if(year%100>0){
                return 29;
            }else if(year%400>0){
                return 28;
            }else{
                return 29;
            }
            break;
        default:
            return 31;
            break;
    }
}


