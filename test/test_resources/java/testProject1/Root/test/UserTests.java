/**
 * Tests for class FindPair.
 *
 * All tests in the folder "test" are executed
 * when the "Test" action is invoked.
 *
 */

import static org.junit.Assert.*;
import org.junit.Test;


public class UserTests {

    @Test
    public final void testFindPair1() {

        // we define some test input and what result we would expect
        int[] testInput = new  int[]{1,5,3,7,10,11};
        int number = 10;
        Pair expectedResult = new Pair (3,7);

        // create a FindPair object and call the findMaximumElement function
        // with test input

        Pair result;
	    FindPair fp = new FindPair();

	    result = fp.find(testInput, number);

        // the actualResult value should be the same as the expectedResult value
        assertTrue("Test input with ascending order",
                expectedResult.isEqual(result));
    }

    @Test
    public final void testFindPair2() {

        // we define some test input and what result we would expect
        int[] testInput = new  int[]{2,5,4,7,14,16, 2, 8};
        int number = 15;
        Pair expectedResult = new Pair (7,8);

        // create a FindPair object and call the findMaximumElement function
        // with test input

        Pair result;
	    FindPair fp = new FindPair();

	    result = fp.find(testInput, number);

        // the actualResult value should be the same as the expectedResult value
        assertTrue("Test input with ascending order",
                expectedResult.isEqual(result));
    }
}