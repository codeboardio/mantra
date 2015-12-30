/**
 * Main class of the Java program.
 */

public class Main {

	public static void main(String[] args) {
		Test tt = new Test();
		TestPuzzle t = new TestPuzzle();
		System.out.println("<font color=\"red\">Write more test cases using the class TestPuzzle to find out the expected output of the routine <b>puzzle2_solution</b></font>\n");
		System.out.println("<table>");
		System.out.println("<tr>");
		System.out.println("<td><b><font color=\"blue\">Input</font></b></td>");
		System.out.println("<td><b><font color=\"blue\">Expects</font></b></td>");
		System.out.println("<td><b><font color=\"blue\">Your solution</font></b></td>");
		System.out.println("</tr>");
		t.runTests();
		System.out.println("</table>");
		System.out.println("<b><font color=\"blue\">You got "+tt.calculateGrade() +" out of 100 points"+"</font></b>\n");
    }
}