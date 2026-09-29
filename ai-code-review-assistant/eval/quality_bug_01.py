def calcdistance(x1, y1, x2, y2):
    # Poor naming and magic numbers
    a = (x2 - x1) ** 2
    b = (y2 - y1) ** 2
    c = 3.14159  # Should be named PI
    d = (a + b) ** 0.5
    return d

# Duplicated code
def add(a, b):
    return a + b

def sum_numbers(x, y):
    return x + y  # Same as add()

# Missing error handling
def divide(a, b):
    return a / b  # No check for division by zero

# Complex function with poor structure
def process_data(data):
    result = []
    for item in data:
        if item['type'] == 'a':
            if item['value'] > 10:
                if item['status'] == 'active':
                    result.append(item)
        elif item['type'] == 'b':
            if item['value'] < 5:
                result.append(item)
    return result
