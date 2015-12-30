/**
 * Represents a pair of numbers.
 * See file FindPair for a description of your task.
 */

class Pair {
    public Pair (int a, int b) {
        first = a;
        second = b;
    }

    private int first; // first element of the pair
    private int second; // second element of the pair

    /**
     * Returns the first element
     */
    public int getFirst() {
        return first;
    }

    /**
     * Returns the second element
     */
    public int getSecond() {
        return second;
    }

    /**
     * Is the 'this' pair equal to p?
     */
     public boolean isEqual(Pair p) {
         return (first==p.getFirst() && second==p.getSecond());
     }

     /**
      * Prints the pair
      */
     public String toString() {
         return "("+first+","+second+")";
     }
}