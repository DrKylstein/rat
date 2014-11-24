var Random = new (function(){
    this.normal = function normal(mean, stdev) {
        return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)*stdev+mean;
    }
    
    this.shuffle = function shuffle(a) { 
        var counter = a.length;
        var temp;
        var index;

        while(counter > 0) {
            index = Math.floor(Math.random()*counter);
            counter--;
            temp = a[counter];
            a[counter] = a[index];
            a[index] = temp;
        }

        return a;
    }

    this.choose = function choose(items) {
        return items[Math.floor(Math.random()*items.length)];
    }

    this.integer = function randRange(min,max) {
        var size = max - min;
        return Math.floor(Math.random()*size) + min;
    }
});