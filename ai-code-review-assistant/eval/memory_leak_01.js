class DataProcessor {
    constructor() {
        this.data = [];
    }

    addData(item) {
        // Memory leak - keeps adding without cleanup
        this.data.push(item);
        // No cleanup mechanism, data keeps growing
    }

    process() {
        // Inefficient - creating new arrays repeatedly
        const result = this.data.map(item => {
            return item.value * 2;
        });
        return result;
    }
}

// Event listener not removed - memory leak
document.addEventListener('click', function handler() {
    console.log('clicked');
});
// Never removed - will leak memory
