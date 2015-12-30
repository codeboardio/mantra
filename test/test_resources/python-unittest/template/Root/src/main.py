# Task: implement a function that given an array
# returns the minimum element. Use a loop to iterate
# over all elements of the array.

def minimum(thelist):
        for element in thelist:
            # Add your code here
            m = element
        return m

def main():
    m = minimum([5,3,2,1])
    print('The min elememt is: ')
    print(m)

if __name__ == '__main__':
    main()
