def process_list(items):
    result = []
    # O(n^2) nested loop - should be O(n) with a set
    for i in range(len(items)):
        for j in range(len(items)):
            if i != j and items[i] == items[j]:
                result.append(items[i])
    return result

def inefficient_rendering(data):
    # Multiple database queries in a loop (N+1 problem)
    results = []
    for item in data:
        result = database_query(f"SELECT * FROM details WHERE id = {item['id']}")
        results.append(result)
    return results

def blocking_operation():
    # Blocking I/O without async/await
    import time
    time.sleep(5)  # Blocks for 5 seconds
    return "done"
