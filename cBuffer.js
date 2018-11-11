var cBuffer = function(length){
  var pointer = 0, buffer = [];

  return {
    get  : function(key){
        if (key < 0){
            return buffer[(pointer + key % buffer.length + buffer.length) % buffer.length ];
        } else if (key == undefined){
            return buffer[(pointer - 1 + buffer.length) % buffer.length];
        } else{
            return buffer[(pointer -1 + key) % buffer.length];
        }
    },
    push : function(item){
      buffer[pointer] = item;
      pointer = (pointer + 1) % length;
      return item;
    },
    prev : function(){
        return this.get();
    },
    next : function(){
        return this.get(1)
    },
    sum : function(){
      return buffer.reduce((a, b) => a + b, 0)
    },
    average : function(){
      if (buffer.length == 0)
        return 0;
      else
        return this.sum()/buffer.length;
    },
    clear : function(){
      pointer = 0;
      buffer = [];
    }
  };
};
//
// var a = cBuffer(10)
//
// for (var i = 0; i<10; i++)
//   a.push(i)
//
// for (var i = 0; i<10; i++)
//   console.log(a.get(-104-i))
//
// console.log(a.get())
// console.log(a.get(-2))
// console.log(a.prev())
// console.log(a.next())
// console.log(a.sum())
// console.log(a.average())
// console.log(a)
// console.log(a.buffer)
// for (var i; i<10; i++)
//   buffer.push(i)
//
// console.log(a.buffer)
//
// console.log(buffer._array[2])
// console.log(buffer.get())


// function CircularBuffer(n) {
//     this._array= new Array(n);
//     this.length= 0;
// }
// CircularBuffer.prototype.toString= function() {
//     return '[object CircularBuffer('+this._array.length+') length '+this.length+']';
// };
// CircularBuffer.prototype.get= function(i) {
//     if (i<0 || i<this.length-this._array.length)
//         return undefined;
//     return this._array[i%this._array.length];
// };
// CircularBuffer.prototype.set= function(i, v) {
//     if (i<0 || i<this.length-this._array.length)
//         throw CircularBuffer.IndexError;
//     while (i>this.length) {
//         this._array[this.length%this._array.length]= undefined;
//         this.length++;
//     }
//     this._array[i%this._array.length]= v;
//     if (i==this.length)
//         this.length++;
// };
// CircularBuffer.prototype.push = function(v) {
//   this._array[this.length%this._array.length] = v;
//   this.length++;
// };
// CircularBuffer.IndexError= {};
