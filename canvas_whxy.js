function canvas_whxy(whxys,width,height,scale){
	this.scale=scale;
	this.whxys=whxys;
	this.canvas=document.createElement("canvas");
	this.canvas.width=width;//1200;
	this.canvas.height=height;//630;
	this.tmp_whxys=[];
	this.watch={};
	this.init();
	
	this.watch_control();
	this.watch_key();
	this.shift_scale();
	
	return this;
}
canvas_whxy.prototype.init=function(){
	var whxys=this.whxys;	
	var count=0;
	for(var i in whxys){
		if(typeof whxys[i].source=="string"){
			var img=new Image;
			img.onload=function(img,i){
				count++;
				whxys[i].source=img;
				whxys[i].w=img.naturalWidth;
				whxys[i].h=img.naturalHeight;
				if(whxys.length==count){
					this.draw_all();
				}
			}.bind(this,img,i)
			img.src=whxys[i].source;
		}else{
			count++;
			if(whxys.length==count){
				this.draw_all();
			}
		}
	}
}
canvas_whxy.prototype.draw_all=function(){
	let whxys=this.whxys;
	let canvas = this.canvas;
	let scale = this.scale;
	let ctx = canvas.getContext('2d');
	ctx.clearRect(0,0,canvas.width,canvas.height);
	for(let i=(whxys.length-1);i>=0;i--){
		let whxy=whxys[i];
		let x=whxy.x*scale;
		let y=whxy.y*scale;
		let w=whxy.w*scale;
		let h=whxy.h*scale;
		ctx.drawImage(whxy.source,x,y,w,h)
		this.control(whxy,i);
	}
}

canvas_whxy.prototype.control=function(whxy,i){
	let scale = this.scale;
	let canvas = this.canvas;	
	let ctx = canvas.getContext('2d');
	ctx.fillStyle="rgb(0,0,0)";
	ctx.strokeStyle="rgb(0,0,0)";
	ctx.lineWidth=10;
	let x=whxy.x*scale;
	let y=whxy.y*scale;
	let w=whxy.w*scale;
	let h=whxy.h*scale;
	this.tmp_whxys.unshift({x:x,y:y,w:w,h:h,i:i});
	// console.log(this.watch)
	if(this.watch.i==i){
		let c=this.draw_rect(w,h,ctx.lineWidth)
		ctx.drawImage(c,x,y)
		let wh_len=3;

		wh=50;
		for(let j=0;j<wh_len;j++){
			for(let k=0;k<wh_len;k++){
				if(j==1 && k==1)continue;
				let wh_x=(w)*j/(wh_len-1)-wh/2+x;
				let wh_y=(h)*k/(wh_len-1)-wh/2+y;
				// ctx.strokeRect(wh_x,wh_y,wh,wh);
				let c=this.draw_rect(wh,wh,ctx.lineWidth)
				ctx.drawImage(c,wh_x,wh_y)
				// ctx.fillRect(wh_x,wh_y,wh,wh);
				this.tmp_whxys.unshift({x:wh_x,y:wh_y,w:wh,h:wh,i:i,wh:{x:j,y:k}});
			}
		}
	}	
}
canvas_whxy.prototype.draw_rect=function (w,h,line){
	var canvas = document.createElement("canvas");
	canvas.width=w
	canvas.height=h
	var ctx = canvas.getContext('2d');
	ctx.fillRect(0,0,w,h);
	ctx.globalCompositeOperation="destination-out";
	ctx.fillRect(line,line,w-line*2,h-line*2);
	return canvas
}
canvas_whxy.prototype.shift_scale=function(){
	var shift=false
	document.onkeydown=function(e){
		if(e.keyCode==16){
			shift=true;
			this.whxys[this.watch.i].scale=this.whxys[this.watch.i].w/this.whxys[this.watch.i].h;
		}
	}.bind(this)
	
	document.onkeyup=function(e){
		if(e.keyCode==16){
			shift=false;
			delete this.whxys[this.watch.i].scale;
		}
	}.bind(this)
}
canvas_whxy.prototype.watch_control=function(){
	var start=function(e){
		console.log('start')
		var canvas = this.canvas;
		this.watch.x=e.pageX-canvas.offsetLeft;
		this.watch.y=e.pageY-canvas.offsetTop;
		
		this.watch.x*=this.scale;
		this.watch.y*=this.scale;
		// console.log(this.watch.y)
		delete this.watch.i;
		for(var j=0;j<this.tmp_whxys.length;j++){
			var tmp_whxy=this.tmp_whxys[j];
			var x=tmp_whxy.x;
			var y=tmp_whxy.y;
			var w=tmp_whxy.w;
			var h=tmp_whxy.h;
			var i=tmp_whxy.i;
			var wh=tmp_whxy.wh;
			
			var flag={};
			flag.x=this.watch.x>=x && this.watch.x<=(x+w);
			flag.y=this.watch.y>=y && this.watch.y<=(y+h);
			
			if(flag.x && flag.y){
				if(wh){
					var func=function(whxys,wh,i,plus){
						if(whxys[i].scale && (wh.x==1 || wh.y==1)){
							return
						}
						if(wh.x==0){
							if(whxys[i].w-plus.w>0){
								whxys[i].x+=plus.w
								whxys[i].w-=plus.w
							}
						}else if(wh.x==2){
							if(whxys[i].w+plus.w>0){
								whxys[i].w+=plus.w
							}
						}
						
						
						if(wh.y==0){
							if(whxys[i].h-plus.h>0){
								whxys[i].y+=plus.h
								whxys[i].h-=plus.h
							}
						}else if(wh.y==2){
							if(whxys[i].h+plus.h>0){
								whxys[i].h+=plus.h
							}
						}
						var tmp={};
						tmp.w=whxys[i].w;
						tmp.h=whxys[i].h;
						
						if(whxys[i].scale){
							whxys[i].w=Math.floor(whxys[i].h*whxys[i].scale);
							if(wh.x==0){
								whxys[i].x-=whxys[i].w-tmp.w
							}
						}
						
					}.bind(this,this.whxys,wh,i)
				}else{
					var func=function(whxys,i,plus){
						whxys[i].x+=plus.w;
						whxys[i].y+=plus.h;
					}.bind(this,this.whxys,i)
				}
				this.watch.move=i;
				this.watch.i=i;
				break;
			}
		}
		this.tmp_whxys=[];
		this.watch.func=func;
		this.draw_all()
	}
	var timer;
	var move=function(e){
		if(isNaN(this.watch.move))return;
		console.log(123)
		clearTimeout(timer)
		timer=setTimeout(function(watch){
			var canvas = this.canvas;
			var y=e.pageY-canvas.offsetTop
			var x=e.pageX-canvas.offsetLeft
			
			var plus={};
			plus.w=x-watch.x;
			plus.h=y-watch.y;
			
			watch.func && watch.func(plus)
			watch.x+=plus.w;
			watch.y+=plus.h;
			
			var w=canvas.width;
			var h=canvas.height;
			
			var ctx = canvas.getContext('2d');
			ctx.clearRect(0,0,w,h);
			this.draw_all()
		}.bind(this,this.watch),0)
	}
	var end=function(e){
		console.log('end')
		delete this.watch.move;
	}
	document.ontouchstart=start.bind(this);
	document.onmousedown=start.bind(this);
	
	document.onmouseup=end.bind(this)
	document.ontouchend=end.bind(this)
	
	document.onmousemove=move.bind(this)
	document.ontouchmove=move.bind(this)
	// console.dir(document)
}
canvas_whxy.prototype.watch_key=function(){
	var count=1;
	var timer;
	document.onkeypress=function(e){
		count*=1.05;
		clearTimeout(timer);
		timer=setTimeout(function(){
			count=1;
		},50)
		var whxys=this.whxys;
		var watch=this.watch;
		if(e.keyCode==97){//左
			whxys[watch.i].x-=count
		}else if(e.keyCode==100){//右
			whxys[watch.i].x+=count
		}else if(e.keyCode==119){//上
			whxys[watch.i].y-=count
		}else if(e.keyCode==115){//下
			whxys[watch.i].y+=count
		}
		whxys[watch.i].x=Math.floor(whxys[watch.i].x);
		whxys[watch.i].y=Math.floor(whxys[watch.i].y);
		this.draw_all()
	}.bind(this)
}
canvas_whxy.prototype.upload=function(e){
	var file=e.target.files[0];
	var f=new FileReader;
	f.onload=function(e){
		var img=new Image;
		img.onload=function(img){
			var whxy={
				x:0,
				y:0,
				w:img.naturalWidth,
				h:img.naturalHeight,
				source:img
			};
			
			this.whxys.unshift(whxy)
			this.draw_all();
		}.bind(this,img);
		img.src=e.target.result;
	}.bind(this);
	f.readAsDataURL(file);
}
