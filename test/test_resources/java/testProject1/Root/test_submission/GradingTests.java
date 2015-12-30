/**
 * Tests used to check a submission.
 *
 * All tests in the "test_submission" folder are used for
 * checking a submission and are executed when the
 * "Submit" action is invoked.
 *
 */

import static org.junit.Assert.*;
import org.junit.Test;


public class GradingTests {

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

    @Test
    public final void testFindPair3() {

        // we define some test input and what result we would expect
        int[] testInput = new int[]{1,5,2, 4, 6, 3,7,10,11};
        int number = 110;
        Pair expectedResult = new Pair (-1,-1);

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
    public final void testFindPair4() {

        // we define some test input and what result we would expect
        int[] testInput = new int[]{1,5,3,7,10,11};
        int number = 6;
        Pair expectedResult = new Pair (1,5);

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
    public final void testFindPair5() {

        // we define some test input and what result we would expect
        int[] testInput = new int[]{36,43, 1,21,5,6,7,8,11};
        int number = 8;
        Pair expectedResult = new Pair (1,7);

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
    public final void testFindPair6() {

        // we define some test input and what result we would expect
        int[] testInput = new int[]{36,43, 1,21,5,6,7,8,11};
        int number = 37;
        Pair expectedResult = new Pair (1,36);

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
    public final void testFindPair7() {

        // we define some test input and what result we would expect
        int[] testInput = new int[]{2,5};
        int number = 7;
        Pair expectedResult = new Pair (2,5);

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
    public final void testFindPair8() {

        // we define some test input and what result we would expect
        int[] testInput = new int[]{2,5, 1};
        int number = 3;
        Pair expectedResult = new Pair (1,2);

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