/*
*6-2 extend()
*/
function extend(o,p)
{
	for(prop in p)
	{
		o[prop] = p[prop];
	}
	return o;
}
/*
*8-3 extend()
*/
var extend = (function(){
	//没有不可枚举的toString属性
	for(var p in {toString:null})
	{
		
		return function extend(o)
		{
			for(var i=0;i<arguments.length;i++)
			{
				var source = arguments[i];
				for(var prop in source)o[prop] = source[prop];
			}
			return o;
		};
	}
	
	//含有不可枚举的属性
	return function patched_extend(o)
	{
		for(var i=0;i<arguments.length;i++)
		{
			var source = arguments[i];
			
			//复制所有的可枚举的属性
			for(var prop in source)o[prop] = source[prop];
			
			//检查特殊属性
			for(var j=0;j<protoprops.length;j++)
			{
				prop = protoprops[j];
				if(source.hasOwnProperty(prop))o[prop] = source[prop];
			}
		}
		
		return o;
	};
	
	//列出所有需要检查的特殊属性
	var protoprops = ["toString","valueOf","constructor","hasOwnProperty",
	"isPrototype","propertyIsEnumerable","toLocalString"];
}());
/*
*例8-4 利用闭包实现私有属性存取器方法
*/
function addPrivatePropoter(o,name,predicate)
{
	var value;
	
	o["get"+name] = function(){return value;};
	o["set"+name] = function(v){
		if(predicate&&!predicate(v)){
			throw Error("set"+name+":invalid value"+v);
		}
		else value = v;	
	};
}

//设置一个空对象o
var o = {};

addPrivatePropoter(o,"Name",function(x){return typeof x=="String";});
o.setName("Frank");
console.log(o.getName());
o.setName(0);

//-----------------------------------
//利用循环创建闭包
//----返回想要的值0-9
function constfunc(v){return function(){return v;};}
var funcs = [];
for(var i=0;i<10;i++)
{
	funcs[i] = constfunc(i);
}
funcs.forEach(function(i){console.log(i())});

//----没有返回想要的值10个10
function constfunc(){
	var funcs = [];
	
	for(var i=0;i<10;i++)
	{
		funcs[i] = function(){return i;};	
	}
	return funcs;
}
var funcs = constfunc();
funcs.forEach(function(i){console.log(i())});

/*
*检查传入的参数是否与期望参数的数量一致
*/
function check(args)
{
	var actual = args.length;
	var expected = args.callee.length;
	
	if(actual!==expected){
		throw Error("Expected"+expected+"args;got"+actual);
	}
}


/*
*bind()方法
*/
function f(y){return this.x+y;}
var o = {x:1};
var g = f.bind(o);
g(2);

var sum=function(x,y){return x+y;}
var succ = sum.bind(null,1);//第一个值绑定为null，第二个值绑定为1
succ(2);

/*
* ECMAScript3 Function.bind()
*/
if(!Function.prototype.bind){
	Function.prototype.bind = function(o,/*,arg*/)
	{
		//将this和arguments的值保存至变量中，以便在后面嵌套的函数中可以使用它们
		var self = this;
		var boundArgs = arguments;
		
		//bind()方法返回值是一个函数
		return function(){
			var args = [];
			var i;
			
			for(i=0;i<boundArgs.length;i++)args.push(boundArgs[i]);
			for(i=0;i<arguments.length;i++)args.push(arguments[i]);
			
			return self.apply(o,args);
		}
	}
}

/*
*8.8使用函数处理数组
*/

//非函数式编程
var data = [1,1,3,5,5];
var total = 0;
for(var i=0;i<data.length;i++)total += data[i];
var mean = total/data.length;

console.log(mean);

total = 0;
for(i=0;i<data.length;i++)
{
	var deviation = data[i]-mean;
	total += deviation*deviation; 
}
var stddev = Math.sqrt(total/(data.length-1));

console.log(stddev);

//函数式编程
var data = [1,3,3,5,5];
var sum = function(x,y){return x+y;}
var square = function(x){return x*x;}

var mean = data.reduce(sum)/data.length;
var deviation = data.map(function(x){return x-mean;})
var stddev = Math.sqrt(deviation.map(square).reduce(sum)/(data.length-1));

//ECMAScript3的map()、reduce()
var map = Array.prototype.map ? function(a,f){return a.map(f);}
:function(a,f){
	var results = [];
	for(var i=0;i<a.length;i++)
	{
		if(i in a)results[i] = f.call(null,a[i],i,a);
	}
	return results;
}
var reduce = Array.prototype.reduce?function(a,f,initial){
	if(arguments.length>2)return a.reduce(f,initial);
	else a.reduce(f);
}:function(a,f,initial)
{
	var i = 0;
	var len = a.length;
	var accumulator;
	
	if(arguments>2)accumulator = initial;
	else
	{
		if(len==0)throw typeError();
		while(i<len)
		{
			if(i in a)
			{
				accumulator = a[++];
				break;
			}
			else
			{
				i++;
			}
		}
	}
	
	while(i<len)
	{
		if(i in a)
		{
			accumulator = f.call(undefined,accumulator,a[i],a);
		}
		i++;
	}
	return accumulator;
}
var data = [1,1,3,5,5];
var sum = function(x,y){return x+y;}
var square = function(x){return x*x;}
var mean = reduce.sum(data,sum)/data.length;
var deviation = map(data,function(){return x-mean;});
var stddev = Math.sqrt(reduce(map(deviation,square)),sum)/(data.length-1);

/*
*8.8.2高阶函数
*/
//求反
function not(f)
{
	return function(){
        var result = f.apply(this,arguments);		
		return !result;
	};
}
//判断偶数
var even = function(x)
{
	return x%2===0;
};

//组成一个新的函数，判断是否为奇数
var odd = not(even);

[1,3,3,5,5].every(odd);

//mapper()函数
function mapper(f)
{
	return function(a){return map(a,f)};
}

var increment = function(x){return x+1;};
var incrementer = mapper(increment);
incrementer([1,2,3]);

//接受两个函数，返回一个新的函数
function compose(f,g)
{
	return function()
	{
		return f.call(this,g.apply(this,arguments));
	};
}
var square = function(x){return x*x;}
var sum = function(x,y){return x+y;}
var squareOfsum = compose(square,sum);
squareOfsum(2,3);

/*
*9.类与模块
*/
//返回一个继承原型对象p的属性的新对象
//如果不存在Object(),退化使用其他方法
function inherit(p)
{
	if(p==null)throw TypeError();
	if(Object.create)return Object.create(p);
	var t = typeof p;
	if(t!=="object"&&t!=="function")throw TypeError();
	function f(){};//定义一个构造函数
	f.prototype = p;//将其原型属性设置为p
	return new f();//使用f()创建p的继承对象
}
//9-1 range.js实现一个能表示值的范围的类
function range(from,to)
{
	var r = inherit(range.methods);
	r.from = from;
	r.to = to;
	
	return r;
}
//原型对象定义方法，这些方法为每个范围对象所继承
range.methods = {
	include:function(x)
	{
		return this.from <= x && this.to >= x;
	}
	,
	foreach:function(f)
	{
		for(var x=Math.ceil(this.from);x<=this.to;x++)f(x);
	}
	,
	toString:function(){return "(" + this.from + "..." + this.to + ")";}
};

var r = range(1,3);
r.include(2); 
r.foreach(console.log);
console.log(r);
//构造函数方法实现range
function Range(from,to)
{
	this.from = from;
	this.to = to;
}

Range.prototype = {
	includes:function(x){
		return x >= this.from && x<= this.to;
	},
	foreach:function(f){
		for(var x=Math.ceil(this.from);x<=this.to;x++)f(x);
	},
	toString:function(){
		return "(the range is "+ this.from +" to "+this.to;
	}
};
//显式增加构造函数到原型
Range.prototype = {
	constructor:Range,
	includes:function(x){
		return x >= this.from && x<= this.to;
	},
	foreach:function(f){
		for(var x=Math.ceil(this.from);x<=this.to;x++)f(x);
	},
	toString:function(){
		return "(the range is "+ this.from +" to "+this.to;
	}
};

//trim()方法
String.prototype.trim = String.prototype || function(){
	if(!this)return this;//空字符串不做处理
}

//9-6.值的任意集合
function Set()
{
	this.value = {};//集合数据保存在对象中
	this.n = 0;//集合的个数
	this.add.apply(this,arguments);
}

//将每个参数都添加到集合
Set.prototype.add = function()
{
	for(var i=0;i<arguments.length;i++)
	{
		var val = arguments[i];
		var str = Set._v2s(val);//把数值转化为字符串，作为唯一标识
		if(!this.value.hasOwnProperty(str))
		{
			this.value[str] = val;//把字符串和值对应起来
			this.n++;//长度加1
		}
	}
	return this;
}

//从集合删除元素，删除的元素由参数指定
Set.prototype.remove = function()
{
	for(var i=0;i<arguments.length;i++)
	{
		var str = Set._v2s(arguments[i]);
		if(this.value.hasOwnProperty(str))
		{
			delete this.value[str];
			this.n--;
		}
	}
	return this;//支持链式方法的调用
};
//检查集合是否有某值
Set.prototype.contain = function(value)
{
	return this.value.hasOwnProperty(Set._v2s(value));
};
//返回集合的大小
Set.prototype.size = function()
{
	return this.n;
};
//遍历集合的所有元素，在指定的上下文中调用f
Set.prototype.foreach = function(f,context)
{
	for(var s in this.value)
	{
		if(this.value.hasOwnProperty(s))
			f.call(context,this.value[s]);
	}
};

//生成唯一的标识符,内部函数
Set._v2s = function(val)
{
	switch(val)
	{
		case undefined: return "u";
		case null     : return "n";
		case true     : return "t";
		case false    : return "f";
		default:switch(typeof val)
		{
			case 'number':return '#'+val;
			case 'string':return '+'+val;
			default      :return '@'+objectId(val);
		}
	}
	
	function objectId(o)
	{
		var prop = "|**objectid**|";//私有属性，用以存放id
		if(!o.hasOwnProperty(prop))
		{
			o[prop].Set._v2s.next++;
		}
		
		return o[prop];
	}
};
Set._v2s.next = 100;

//9-7枚举类型
function enumeration(namesValue)
{
	//这个虚拟的构造函数是返回值
	var enumeration = function(){ throw "Can't Instantiate Enumerations";};
	
	//枚举值继承这个对象
	var proto = enumeration.prototype = 
	{
		constructor:enumeration,
		toString: function(){return this.name;}, //返回名字
		valueOf:function(){return this.values;}, //返回值
		toJSON: function(){return this.name;}  //转化为JSON
	};
	
	enumeration.values = []; //用以存放枚举对象的数组
	
	//创建新类型的实例
	for(name in namesValue)//遍历每个值
	{
		var e = inherit(proto);  //创建一个代表它的对象
		e.name = name;           //给它一个名字
		e.value = namesValue[name];  //给它一个值
		enumeration[name] = e;     //把它设置为构造函数的属性
		enumeration.values.push(e);  //把它存储到值数组中
	}
	
	//一个类方法，用来对类的实例进行迭代
	
	enumeration.foreach = function(f,c)
	{
		for(var i=0;i<this.values.length;i++)
		{
			f.call(c,this.values[i]);
		}
	};
	
	//返回标识这个新类型的构造函数
	return enumeration;
}

//9-8使用枚举来表示一副扑克牌

//定义一个表示“玩牌”的类
function Card(suit,rank)
{
	this.suit = suit;  //花色
	this.rank = rank;  //点数
}

//使用枚举类型来定义花色和点数
Card.Suit = enumeration({Cluns:1,Diamonds:2,Hearts:3,Spades:4});
Card.Rank = enumeration({Two:2,Three:3,Four:4,Five:5,Six:6,Seven:7,Eight:8,Nine:9,Ten:10,Jack:11,Quee:12,King:13,Ace:14});

//定义用于描述牌面的文本
Card.prototype.toString = function()
{
	return this.rank.toString() + " of " + this.suit.toString();
}

//比较两张牌的大小
Card.prototype.compareTo = function(that)
{
	if(that.rank>this.rank)return -1;
	if(that.rank<this.rank)return  1;
	
	return 0;
}
//排序
Card.orderBySuit = function(a,b)
{
	return a.compareTo(b);
}

//定义一副牌的类
function Deck()
{
	var cards = this.cards = []; //一副牌就是由牌组成的数组
	Card.Suit.foreach(function(s){  //初始化这副牌
		Card.Rank.foreach(function(r){
			cards.push(new Card(s,r));
		});
	});
}

//洗牌，返回洗好的牌

Deck.prototype.shuffle = function()
{
	var deck = this.cards;
	var len = deck.length;
	for(var i=len-1;i>0;i--)
	{
		var r = Math.floor(Math.random()*(i+1));
		var temp = deck[i];
		
		temp = deck[i],deck[i] = deck[r],deck[r] = temp;//随机交换
	}
	return this;
};

//发牌：返回牌的数组
Deck.prototype.deal = function(n)
{
	if(this.cards.length<n)throw "Out the cards.";
	return this.cards.splice(this.cards.length-n,n);//返回所要数量的牌，牌要了之后，就会被删除，相当于每张牌都是独一的
};

//创建一副新扑克牌
var deck = (new Deck().shuffle());//洗牌
var hand = deck.deal(13).sort(Card.orderBySuit);//发牌，并排序

hand.forEach(function(h){console.log(h.toString());});//输出所有抽取的牌


//使用extend向Set.prototype添加方法

extend(Set.prototype,{
	//将集合转化为字符
	toString:function(){
		var s = "{";
		var i = 0;
		this.foreach(function(v){
		s += ((i++>0)?",":"")+v;
		});
		
		return s + "}";
	},
	//类似toString(),但是对于所有的值都将调用toLocalString()
	toLocalString:function(){
		var s = "{";
		var i =0;
		this.foreach(function(v){
			if(i++>0) s += ",";
			if(v==null)s += v;
			else s += v.toLocalString();
		});
	    return s + "}";
	},
	toArray:function(){
		var a = [];
		this.foreach(function(v){ a.push(v);});
		return a;
	}
});

//Set的equals方法
Set.prototype.equals = function(that)
{
	if(this==that)return true;
	
	if(!(that instanceof Set))return false;
	
	//长度不一样，则不相等
	if(this.size()!=that.size())return false;
	
	try{
		this.foreach(function(v){
			if(!that.contains(v))throw false;
		});
		return true;
	}catch(x){
		if(x===false)return false;
		throw x;
	}
};

//Range的equals方法
Range.prototype.constructor = Range;//Range类重写它的constructor属性

Range.prototype.equals = function(that){
	if(that==null)return false;
	//当且仅当这两个端点相同时，才返回true
	return this.from == that.from && this.to == that.to;
};
//Range的compareTo方法
Range.prototype.compareTo = function(that)
{
	if(!(that instanceof Range))throw new Error("Can't compare a Range with " + that);
	var diff = this.from - that.from;
	if(diff==0)diff = this.to - that.to;
	return diff;
};

//9-9方法借用的范型实现
var generic = function()
{
	/*
	*返回一个字符串，其包含构造函数的名字（如果构造函数有名字的话）
	*以及返回所有非继承来的、非函数属性的名字和值
	*/
	toString:function()
	{
		var s = "[";
		if(this.constructor&&this.constructor.name)
			s += this.constructor.name + ":";
		
		//枚举所有非继承且非函数的属性
		var n = 0;
		for(var name in this)
		{
			if(!this.hasOwnProperty(name))continue;//跳过继承来的属性
			var value = this[name];
			if(typeof value == "function")continue;//跳过方法
			if(n++) s += ", ";
		}
		
		return s + "]";
	},
	//通过比较thia和that的构造函数和实例属性来判断它们是否相等
	equals:function(that){
		if(that==null)return false;
		if(this.constructor !== that.constructor)return false;
		for(var name in this)
		{
			if(name=="|**objectid**|")continue;//跳过特殊属性
			if(!this.hasOwnProperty(name))continue;//跳过继承来的属性
			if(this[name !== that[name]])return false;//比较是否相等
		}
		return true;//所以对象匹配，两个对象相等
	}
};

//Set()重载
function Set()
{
	this.values = {};
	this.n = 0;
	
	if(arguments==1 && isArrayLike(arguments[0]))
		this.add(this.arguments[0]);
	else if(argumentslength > 1)
		this.add.apply(this,arguments);
}

//9-11定义子类

//参数解析：superClass 父类的构造函数
//constructor 新的子类的构造函数
//methods 实例方法：复制到原型中
//static 类属性：复制到构造函数中
function defineSunClass(superClass,constructor,methods,static)
{
	//建立子类的原型对象
	constructor.prototype = inherit(superClass.prototype);
	constructor.prototype.constructor = constructor;
	
	//像对常规类一样复制方法和类属性
	if(methods) extend(constructor.prototype,methods);
	if(static) extend(constructor,static);
	
	//返回这个类
	return constructor;
}


//一个简单的子类
function SingletonSet(number){
	this.member = member;
}

//创建一个原型对象，这个原型对象继承自Set的原型
SingletonSet.prototype = inherit(set.prototype);

//给原型添加属性
//如果有同名的属性就覆盖Set.prototype的同名属性
extend(SingletonSet.prototype,{
	constructor:SingletonSet,
	add:function(){throw "read-only set";},
	remove:function(){throw "read-only set";},
	size:function(){return 1;},
	foreach:function(f,context){f.call(context,this.member);},
	contains:function(x){return x == this.member;}
});

//在子类中调用父类的构造函数和方法
//NonNullSet是Set的子类，它的成员不能是null
function NonNullSet()
{
	//仅链接到父类
	//作为普通函数调用父类的构造函数来初始化通过该构造函数来创建的对象
	Set.apply(this,arguments);
}

//将NonNullSet设置为Set的子类
NonNullSet.prototype = inherit(Set.prototype);
NonNullSet.prototype.constructor = NonNullSet;

//为了将null和undefined排除在外，只需重写add()方法返回值是一个函数
NonNullSet.prototype.add = function()
{
	for(var i=0;i<arguments.length;i++)
	{
		if(arguments[i]==null)
			throw Error("Can't add null or undefined to a NonNullSet");
		
		//调用父类的add()方法以执行实际插入操作
		return Set.prototype.add.apply(thi,arguments);
	}
}

//9-15使用组合代替继承的集合的实现
var FilteredSet = Set.extend(
    function FilteredSet(set,filter)
	{
		//构造函数
		this.set = set;
		this.filter = filter;
	},
	{
		//实例方法
		add: function()
		{
			//如果已有过滤器，直接使用
			if(this.filter)
			{
				for(var i=0;i<arguments.length;i++)
				{
					var v = arguments[i];
					if(!this.filter(v))
					{
						throw new Error("FilteredSet:value: " + v + " rejected by filter");
					}
				}
			}
			
			//调用set中的add()方法
			this.set.add.apply(this.set,arguments);
			return this;
		},
		remove: function()
		{
			this.set.remove.apply(this.set,arguments);
			return this;
		},
		contains:function(v){return this.set.contains(v);},
		size:function(){return this.set.size();},
		foreach:function(f,c){this.set.foreach(f,c);}
	}
);
//创建子类
var s = new FilteredSet(new Set(),function(x){return x!=null;});


//9-16抽象类与非抽象Set类的层次结构
//这个函数可以用左任何抽象方法
function abstractmethod(){throw new Error("abstract method.");}

//AbstractSet类定义了一个抽象方法
function AbstractSet()
{
   throw new Error("Can't instantiate abstract classes");
   AbstractSet.prototype.contains = abstractmethod; 
}
//NotSet是AbstractSet的一个非抽象子类
//所以不在其他集合中的成员都在这个集合中
var NotSet = AbstractSet.extend(
    function NotSet(set){this.set = set;},		{
	{
		contains:function(x){return !this.set.contains(x);},
		toString:function(x){return "~" + this.set.toString();},
		equals:function(that)
		{
			return that instanceof NotSet && this.set.equals(this.set);
		}
	}		
);
//AbstractEnumerableSet是AbstractSet的一个抽象子类
var AbstractEnumerableSet = AbstractSet.extend(
   function(){throw new Error("Can't instantiate abstract classes");},
   {
	   size:abstractmethod,
	   foreach:abstractmethod,
	   isEmpty:function(){return this.size()==0;},
	   toString:function(){
		   var s = "{";
		   var i = 0;
		   this.foreach(function(v){
			   if(i++>0)s += ",";
			   s += v;
		   });
		   
		   return s + "}";
	   },
	   toLocalString:function()
	   {
		   var s = "{";
		   var i = 0;
		   this.foreach(function(v){
			  if(i++>0)s += ",";
			  if(v == null)s += v;
			   else s+= v.toLocalString();
		   }),
		    return s + "}";
	   },
	   toArray:function()
	   {
		   var s = [];
		   this.foreach(function(v){a.push(v);});
		   return a;
	   },
	   equals:function(that)
	   {
		   if(!that.instanceof AbstractEnumerableSet)return false;
		   if(this.size()!=that.size())return false;
		   try {
			   this.foreach(function(v){if(!that.contains(v))throw false;});
			   return true;
		   }catch(x){
			   if(x==false)return false;
			   throw x;
		   }
	   }
   }
);
//SingletonSet是AbstractEumerableSet的非抽象类
var SingletonSet = AbstractEnumerableSet.extend(
    function SingletonSet(member){this.member = member;},
	{
		contains:function(x){return x== this.member;},
		size:function(){return 1;},
		foreach:function(f,ctx){f.call(ctx,this.member;);}
	}
);
var AbtsractWritableSet = AbstractEnumerableSet.extend(
    function(){throw new Error("Can't instantiate abtract classes");},
    {
        add:abstractmethod,
		remove:abstractmethod,
        union:function(that){
			var self = this;
			that.foreach(function(v){self.add(v);});
			return this;
		},		
		intersection:function(that){
			var self = this;
			this.foreach(function(v){
				if(!that.contains(v))self.remove(v);
				return this;
			});
		},
		difference:function(that){
			var self = this;
			that.foreach(function(v){
			    self.remove(v);
			});
			return this;
		}
	}
);
//ArraySet是AbstractWriableSet的非抽象子类
var ArraySet = AbtsractWritableSet.extend(
    function ArraySet(){
		this.value = [];
		this.add.apply(this,arguments);
	},
	{
		contains:function(v){return this.values.indexOf(v)!=-1;},
		size:function(){return this.values.length;},
		foreach:function(f,c){this.values.forEach(f,c);},
		add:function(){
			for(var i=0;i<arguments.length;i++)
			{
				var arg = arguments[i];
				if(!this.contains(arg))this.values.push(arg);
			}
			return this;
		},
		remove:function(){
			for(var i=0;i<arguments.length;i++)
			{
				var p = this.values.indexOf(arguments);
				if(p==-1)continue;
				this.values.splice(p,1);
			}
			return this;
		}
	}
);

//9-17定义不可枚举的属性
//将代码包装在一个匿名函数中，这样定义的变量就在这个函数作用域内
(function(){
	//定义一个不可枚举的属性objectId,它可以被所以对象继承
	Object.defineProperty(Object.prototype,"objectId",{
		get:idGetter,//取值器
		enumerable:false,//不可枚举
		configurable:false//不可配置，所以不能删除
	});
	
	//当读取objectId的时候直接调用这个getter函数
	function idGetter()
	{
		if(!idprop in this)//如果对象不存在id
		{
			if(!Object.isExtensible(this))//并且可以增加属性
			{
				throw Error("Can't define id for nonextensible objects");
			}
			Object.defineProperty(this,idprop,{
				value:nextid++,//给它一个值
				writable:false,//只读
				enumerable:false,//不可枚举
				configurable:false//不可删除
			});
		}
		return this[idprop];//返回已有的或新的值
	}
	
	//idGetter()用到了这些变量，这些都属于私有变量
	var idprop = "|**objectId**|";
	var nextid = 1;//初始值
}());//立即执行这个包装函数

//9-18创建一个不可变的类
function Range(from,to)
{
	var props = {
		from:{value:from,enumerable:true,writable:false,configurable:false},
		to:{value:to,enumerable:true,writable:false,configurable:false}
	};
	
	if(this instanceof Range)//如果构造函数来调用
	   Object.defineProperties(this,props);//定义属性
	else
        return Object.create(Range.prototype.props);//创建并返回这个新的Range对象
}
Object.defineProperties(Range.prototype,{
	includes:{
		value:function(x){return this.from<=x&&x<=this.to;},
	},
	foreach:{
		value:function(f){
			for(var x=Math.ceil(this.from);x<=this.to;x++)f(x);
		}
	},
	toString:{
		value:function(){return "("+this.from+"..."+this.to+")";}
	}	
});

//9-19属性描述符工具函数
//将o的指定名字（或所有）的属性设置为不可写的和不可配置的
function freezeProps(o)
{
	//如果只有一个参数，则使用所有的属性；否则传入了指定名字的属性
	var props = (arguments.length==1)?Object.getOwnPropertyName(o):Array.prototype.splice.call(arguments,1);
	//忽略不可配置的属性
	if(!Object.getOwnPropertyDescriptor(o,n).configurable)return;
	Object.defineProperty(o,n,{writable:false,configurable:false});
	
	return o;
}

//将o的指定名字（或所有）的属性设置为不可枚举的和可配置的
function hideProps(o)
{
	var props = (arguments.length==1)?Object.getOwnPropertyName(o):Array.prototype.splice.call(arguments,1);
	props.forEach(function(n){
		if(!Object.getOwnPropertyDescriptor(o,n).configurable)return;
		Object.defineProperty(o,n,{enumerable:false});	
	});
	
	return o;
}

//9-20将Range类的端点严格封装起来
function Range(from,to)
{
	if(from>to)throw new Error("Range:form must be <= to");
	
	//定义存取器方法以维持不变
	function getFrom(){return from;}
	function getTo(){return to;}
	function setFrom(f)
	{
		if(f<=to)from = f;
		else throw new Error("Range:form must be <= to");
	}
	function setTo(t)
	{
		if(t>=from)to = t;
		else throw new Error("Range: to must be >= from");
	}
	
	//将使用取值器的属性设置为可枚举的，不可配置的
	Object.defineProperties(this,{
	   from:{get:getFrom,set:setFrom,enumerable:true,configurable:false},
	   to:{get:getTo,set:setTo,enumerable:true,configurable:false}
	});
}

Range.prototype = hideProps({
	constructor:Range,
	includes:function(x){return this.from<=x&&x<=this.to;},
	foreach:function(f)for(var x=Math.ceil(this.from);x<=this.to;x++)f(x);
	toString:function{return "("+this.from+"..."+this.to+")";}
});

//9-22 StringSet:利用ECMAScript的特性定义的子类
function StringSet()
{
	this.set = Object.create(null);//创建一个不包含原型的对象
	this.n = 0;
	this.add.apply(this,arguments);
}
StringSet.prototype = Object.create(AbstractWritableSet.prototype,{
	constructor: { value:StringSet},
	contains: { value:function(x){return x in this.set;},
	size: { value:function(x){return this.n;}},
	foreach: { value:function(f,c){Object.keys(this.set).forEach(f,c);}},
	add: { value:function(){
		for(var i=0;i<arguments.length;i++)
		{
			if(!(arguments[i] in this.set))
			{
				if(!(arguments[i] in this.set))
				{
					this.set[arguments[i]] = true;
					this.n++;
				}
			}
		}
		return this;
	}},
	remove: { value:function(){
		for(var i=0;i<arguments.length;i++){
			if(arguments[i] in this.set)
			{
				delete this.set[arguments[i]];
				this.n--;
			}
		}
		return this;
	   }
    }
});
/*
*10.正则表达式
*/
var url = /(\w+):\/\/([\w.]+)\/(\S*)/;
var text = "Visit my blog at http://www.huangbixia.cn";
var result = text.search(url);
if(result!=null)
{
	var fullurl = result[0];
}

var pattern = /Java/g;
var text = "JavaScript if more fun than Java!";
var result;
while((result=pattern.exec())!=null)
{
	console.log("Matched '"+result[0]+"'" +"at position "+result.index+";next search begins at"+pattern.lastIndex);
}

/*
* 11 JavaScript的子集和扩展
*/
//let的使用
function oddsums(n){
   let total = 0,result=[];//在函数内部都是有定义的
   for(let x=1;x<=n;x++)//x只在循环体内有定义
   {
      let odd = 2*x-1;  //odd只在循环体内有定义
      total += odd;
      result.push(total);
   }
   console.log(x+odd);//报错
   return result;
}
oddsums(5);

//解构赋值
let [x,y] = [1];//x=1,y=undefined
[x,y] = [1,2,3];//x=1,y=2
[,x,,y] = [1,2,3,4];//x=2,y=4

let first,second,all;
all = [first,second] = [1,2,3,4];//first=1,second=2,all=[1,2,3,4]

let [one,[twoA,twoB]] = [1,[2,2.5],3];//one=1,twoA=2,twoB=2.5

//等价于let sin = Math.sin,cos = Math.cos,tan = Math.tan
let {sin:sin,cos:cos,tan:tan} = Math;

//for in 和 for each
let o = {one:1,two:2,three:3};
for(let p in o)console.log(p);
for each(let v in o)console.log(v);

//迭代器
function counter(start)
{
  let nextValue = Math.round(start);//表示迭代器的一个私有状态
  return {next:function(){return nextValue++;}}//返回迭代器对象
}

let serialNumberGenerator = counter(1000);
let sn1 = serialNumberGenerator.next();
let sn2 = serialNumberGenerator.next();

//这个函数返回了一个可迭代的对象，用以表示该范围内的一个数字
function range(min,max)
{
	return {
		//返回一个表示这个范围的对象
		get min(){return min;},  //范围边界是固定的
		get max(){return max;},  //并在闭包内保存起来
		includes:function(x){
			return min <= x && x <= max;
		},
		toString:function(){
			return "[" + min + "," + max + "]";
		},
		__iterator__:function(){
			let val = Math.ceil(min); //范围内的整数都是可迭代的
            return {
				next:function(){
					if(val > max)
						throw StopIteration;
					return val++;
				}
			};			
		}
	};
}

for(let i in range(1,10)) console.log(i);


//针对一个整数范围定义一个生成器
function range(min,max)
{
	for(let i=Math.ceil(min);i<=max;i++)yield i;
}

//数组推导
var data = [2,3,4,-5];
var squares = [x*x for each(x in data)];
var roots = [Math.sqrt(x) for each(x in data)if(x>=0)];

/*
*   15章
*/

//15-1通过ID查找多个元素
function getElement(/*ids*/)
{
	var elements = {};
	for(var i=0;i<arguments,length;i++)
	{
		var id = arguments[i];
		var elt = document.getElementById(id);
		if(elt==null)
		{
			throw new Error("No element with id: "+id);	
		}
		elements[id] = elt;
	}
	return elements;
}

//15-2可移植的文档遍历函数
/*
*返回元素e的第n层祖先元素，如果不存在此类祖先或祖先不是Element
则返回null,如果为0，则返回e本身，如果n为1，则返回其父元素，
如果n为2，则返回其祖父元素
*/
function parent(e,n)
{
	if(n===undefined)n=1;
	while(n--&&e)e = e.parentNode;
	if(!e||e.nodeType!==1)return null;
}
/*
*返回元素的第n个兄弟元素
如果n为正，返回后续的第n个兄弟元素
如果n为正，返回前面的第n个兄弟元素
如果n为零，返回e本身
*/
function sibling(e,n){
	while(e&&n!==0){
		if(n>0){  //查找后续的兄弟
			if(e.nextElementSibling)e=e.nextElementSibling;
			else{
				for(e=e.nextSibling;e&&e.nodeType!==1;e=e.nextSibling)
					/*空循环*/;
			}
		}n--;
	    else{//查找前面的兄弟
			if(e.previousElementSibling)e=e.previousElementSibling;
			else{
				for(e=e.previousElementSibling;e&&e.nodeType!==1;e=e.previousElementSibling)
					/*空循环*/;
			}
		 n++:
		}
	}
	return e;
}
/*
*返回元素e的第n代子元素，如果不存在则为null
负值n代表从后往前技术，0表示第一个子元素，而-1代表最后一个，
*/
function child(e,n){
	if(e.children){
		if(n<0)n+=e.children.length;
		if(n<0)return null;
		return e.children[n];
	}
	
	if(n>=0){
		if(e.firstElementChild)e=e.firstElementChild;
		else{
			for(e=e.firstChild;e&&e.nodeType!==1;e=e.nextSibling)
				/*空循环*/;
		}
		return sibling(e,n);
	}
	else
	{
		if(e.lastElementChild)e=e.lastElementChild;
		else{
			for(e=e.lastChild;e&&e.nodeType!==1;e=e.previousSibling)
				/*空循环*/;
		}
		return sibling(e,n+1);
	}
}
//15-3查找元素的后代中节点中的所以Text节点
//返回元素e的纯文本内容，递归进入其子元素
function textContent(e)                                                                                                           
{
	var child,type,s = "";
	for(child==e.firstChild;child!=null;child.nextSibling){
		type = child.nodeType;
		if(type===3||type===4)//Text和CDATASection节点
		  s += child.nodeType;
		else if(type==1)//递归Element节点
          s += textContent(child);			
	}
	return s;
}


//从指定的URL，异步加载和执行脚本
function loadasync(url)
{
	var head = document.getElementsByTagName("head")[0];
	var s = document.createElement("script");
	s,src = url;
	head.appendChild(s);
}

//将child节点插入到parent中，使其成为第n个子节点
function insertAt(parent,child,n)
{
	if(n<0||n>parent.childNodes.length)throw new Error("invalid index");
	else if(n==parent.childNodes.length)parent.appendChild(child);
	else parent.insertBefore(child,parent.childNodes[n]);
}


//15-4表格的行排序
function sortrows(table,n,comparator){
	var tbody = table.tBodies[0];
	var rows = tbody.getElementsByTagName("tr");
	rows = Array.prototype.slice.call(rows,0);
	
	//基于第n个<td>元素的值进行对行排序
	rows.sort(function(row1,row2){
		var cell1 = row1.getElementsByTagName("td")[n];
		var cell2 = row2.getElementsByTagName("td")[n];
		
		var val1 = cell1.textContent || cell1.innerHTML;
		var val2 = cell2.textContent || cell2.innerHTML;
		if(comparator)return comparator(val1,val2);
		if(val<val2)return -1;
		else if(val1>val2)return 1;
		else return 0;
	});
	
	for(var i=0;i<rows.length;i++)
	{
		tbody.appendChild(rows[i]);
	}
}

//查找表格的<th>元素（假设只有一行）
function makeSortable(table){
	var headers = table.getElementsByTagName("th");
	for(var i=0;i<headers.length;i++)
	{
		(function(n){
			//嵌套函数来创建本地作用域
			headers[i].onclick = function(){
				sortrows(table,n);
			};
		}(i));//将i的值赋给局部变量n
	}
}

//倒序排序节点中的子节点
function reverse(n){
	//创建一个DocumentFragment作为临时容器
	var f = document.createDocumentFragment();
	while(n.lastChild)f.appendChild(n.lastChild);
	
	//最后，把f的所以子节点一次全部返回n中
	n.appendChild(f);
}

//18-2获取HTTP响应的onreadystatechange
function getText(url,callback){
	var request = new XMLHttpRequest();
	request.open("GET",url);
	request.onreadystatechange = function(){
	if(request.readyState==4&&request.status==200){
	    var type = request.getResponseHeader("Content-Type");
		if(type.match(/^text/))
			callback(request.responseText);
	}
	};
	request.send(null);
	
}

//18-3解析HTTP响应
//当响应到达时，把他解析后的XML Document对象、解析后的JSON对象
//或字符串形式传递给回调函数

function get(url,callback){
	var request = new XMLHttpRequest();
	request.open("GET",url);
	request.onreadystatechange = function(){
		if(request.readyState==4&&request.status==200){
			var type = request.getResponseHeader("Content-Type");
			if(type.indexOf("xml")!==-1&&request.responseXML)
				callback(request.responseXML);
			else if(type=="application/json")
				callback(JSON.parse(request.responseText));
			else
				callback(request.responseText);
		}
	};
	request.send(null);
}


//18-4用于HTTP请求的编码对象
function encodeFormData(data){
	if(!data)return "";
	var paris = [];
	for(var name in data){
		if(!data.hasOwnProperty(name))continue;//跳过继承属性
		if(typeof data[name] == "function")continue;//跳过方法
		var value = data[name].toString();//把值转化为字符串
		name = encodeURLComponent(name.replace("%20","+"));
		value = encodeURLComponent(value.replace("%20","+"));
		paris.push(name+"="+value);//记住名=值对
		return paris.join("&");//返回使用"&"连接的名/值对
	}
}

//18-5使用表单编码数据发起一个HTTP POST请求
function postData(url,data,callback){
	var request = new XMLHttpRequest();
	request.open("POST",url);
	request.onreadystatechange = function(){
		if(request.readyState==4&&callback)
			callback(request);
	};
	
	request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	request.send(encodeFormData(data));
}


//18-5使用表单编码数据发起一个GET请求
function getData(url,data,callback){
	var request = new XMLHttpRequest();
	request.open("GET",url+"?"+encodeFormData(data));
		request.onreadystatechange = function(){
		if(request.readyState==4&&callback)
			callback(request);
	};
	request.send(null);
}

//18-9使用HTTP POST请求上传文件
whenReady(function(){
	var elts = ducument.getElementsByTagName("input");//所以input元素
	for(var i=0;i<elts.length;i++){//遍历它们
	    var input = elts[i];
		if(input.type!=="file")continue;//跳过所以非文件上传元素
		var url = input.getAttribute("data-upload");//获取上传URL
		if(!url)continue;//跳过任何没有URL的元素
		
		//当用户选择文件时
		input.addEventListener("change",function(){
			var file = this.files[0];
			if(!file)return;//没有文件，不做任何事情
			var xhr = new XMLHttpRequest();
			xhr.open("POST",url);
			xhr.send(file);//将文件作为主体发送
		});
},false);

//18-10使用POST方法发送multipart/form-data请求主体
function postFormData(url,data,callback){
	if(typeof FormData=="undefined")
		throw new Error("FormData is not implemented");;
	var request = new XMLHttpRequest();
	request.open("POST",url);
		request.onreadystatechange = function(){
		if(request.readyState==4&&callback)
			callback(request);
	};
	
	var formdata = new FormData();
	for(var name in data){
		if(!data.hasOwnProperty(name))continue;//跳过继承属性
		if(typeof data[name] == "function")continue;//跳过方法
		var value = data[name];
	    
		formdata.append(name,value);
	}
	request(formdata);
}

//18-12实现超时
//发起HTTP GET请求获取指定URL的内容
//如果响应成功到达，传入responseText给回调函数
//如果响应在timeout毫秒内没有到达,终止这个请求
//浏览器可能在abort()后触发readystatechange
//如果是部分请求结果到达，甚至可能设置status属性
//所以需要设置一个标记,当部分且超过的响应到达时不会调用回调函数
function timedGetText(url,timeout,callback){
	var request = new XMLHttpRequest();
	var timedout = false;
	
	//启动计时器，在timeout毫秒后将终止请求
	var timer = setTimeout(function(){
		timedout = true;
		request.abort();//终止请求
	},timeout);
	
	request.open("GET",url);
	request.onreadystatechange = function(){
		if(request.readyState!==4)return;//忽略未完成的请求
        if(timedout)return;//忽略终止请求
		clearTimeout(timer);//取消等待超时
		if(request.status==200)
			callback(request.responseText);
	};
	request.send(null);
}

//20-1解析document.cookie属性值
function getCookie()
{
	var cookie = {};
	var all = document.cookie;
	if(all==="")return cookie;
	var list = all.split("; "); //分离出名/值对
	for(var i=0;i<list.length;i++)
	{
		var cookie = list[i];
		var p = cookie.indexOf("=");
		var name = cookie.substring(0,p);//获取cookie名字
		var value = cookie.substring(p+1);//获取cookie对应的值
		value = decodeURIComponent(value);
		cookie[name] = value; //把名/值对存储到对象中
	}		
	return cookie;
	
}

//20-2基于cookie的存储API
function cookieStorage(maxage,path){//两个参数分别代表存储有效期和作用域

//获取一个存储全部cookie信息的对象
var cookie = (function(){
	var cookie = {};
	var all = document.cookie;
	if(all==="")return cookie;
	var list = all.split("; "); //分离出名/值对
	for(var i=0;i<list.length;i++)
	{
		var cookie = list[i];
		var p = cookie.indexOf("=");
		var name = cookie.substring(0,p);//获取cookie名字
		var value = cookie.substring(p+1);//获取cookie对应的值
		value = decodeURIComponent(value);
		cookie[name] = value; //把名/值对存储到对象中
	}		
	return cookie;
}());
	
	//将所有cookie的名字存储到一个数组中
	var keys = [];
	for(var key in cookie){
		keys.push(key);
	}
	
	//定义存储API公共的属性和方法
	//存储cookie的个数
	
	//返回第n个cookie的名字，如果n越界则返回null
	this.keys = function(n){
		if(n<0||n>=keys.length)return null;
		return keys[n];
	};
	
	//返回指定名字的cookie值，如果不存在则返回null
	this.getItem = function(name){
	     return cookie[name]}||null;
	};
	
	//存储cookie值
	this.setItem = function(key,value){
		if(!key in cookie){  //如果要存储的cookie还不存在
		   keys.push(key);
		   this.length++;
		}
		
		cookie[key] = value;
		//开始正式设置cookie
		//首先将要存储的cookie值进行编码，同时创建一个”名字=编码后的值“形式的字符串
		var cookie = key + "=" +encodeURLComponent(value);
		
		//将cookie的属性加入到该字符串中
		if(maxage)cookie += "; max-age="+maxage;
		if(path)cookie += "; path="+path;
		
		//通过document.cookie属性来设置cookie
		document.cookie = cookie;
	}
	
	//删除指定的cookie
	this.removeItem = function(key){
		if(!(key in cookie))return;//如果cookie不存在，则什么也不做
		
		//从内部维护的cookie组删除指定的cookie
		delete cookie[key];
		
		//同时将cookie的名字也在内部的数组中删除
		for(var i=0;i<keys.length;i++){
			if(keys[i]==key){
				keys.splice(i,1);
				break;
			}
		}
		this.length--;
		
		//最终通过将该cookie值设置为空字符串以及将有效期设置为0来删除指定的cookie
		document.cookie = key + "=;max-age = 0;"
	};
	
	//删除所以的cookie
	this.clear = function()
	{
		for(var i=0;i<cookie.length;i++)
			document.cookie = keys[i]+"=; max-age=0";
	};//重置所有的内部状态
	cookie = {};
	keys = [];
	this.length = 0;
}