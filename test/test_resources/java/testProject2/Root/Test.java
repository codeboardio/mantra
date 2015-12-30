import java.util.Arrays;

public class Test {
    public Test() {
        estudent = new Puzzle2();
        master = new SolLuna();
    }
    
    private Puzzle2 estudent=new Puzzle2();
    private SolLuna master= new SolLuna();
    
    public void run (String[] a, int i) {
        String[] r1, r2;
        r1 = new String[a.length];
        r2 = new String[a.length];
        System.out.println("<tr>");
        System.out.println("<td>"+Arrays.toString(a)+"</td>");
        r1 = Arrays.copyOf(a,a.length);
        r1 = master.luna(r1,i);
        System.out.println("<td><b>"+Arrays.toString(r1)+"</b></td>");
            
        r2 = Arrays.copyOf(a,a.length);
        r2 = estudent.puzzle2Solution(r2,i);
        System.out.println("<td>"+Arrays.toString(r2)+"</td>");
        System.out.println("</tr>");
       
    } 
    
    public int calculateGrade() {
        int correct = 0;
        int total = 0;
        String [] aa;
        
        aa = new String[]{"martin", "nordio", "christian", "estler"};
        correct = correct + correctResult(aa,0);
        total = total + 1;
            
        correct = correct + correctResult(aa,2);
        total = total + 1;
            
        correct = correct + correctResult(aa,4);
        total = total + 1;
            
        aa = new String[]{"ala", "rotator"};
        correct = correct + correctResult(aa,0);
        total = total + 1;
            
        correct = correct + correctResult(aa,1);
        total = total + 1;
            
        correct = correct + correctResult(aa,2);
        total = total + 1;
            
        aa = new String[]{"christian", "estler","ala","amddma","abcdefghhgfedcba","abcdefghhgfedcbaqw","rio cuarto","zurich eth"};
        correct = correct + correctResult(aa,0);
        total = total + 1;
        correct = correct + correctResult(aa,1);
        total = total + 1;
        correct = correct + correctResult(aa,2);
        total = total + 1;
        correct = correct + correctResult(aa,3);
        total = total + 1;
        correct = correct + correctResult(aa,4);
        total = total + 1;
        correct = correct + correctResult(aa,5);
        total = total + 1;
        correct = correct + correctResult(aa,6);
        total = total + 1;
        correct = correct + correctResult(aa,7);
        total = total + 1;        
        correct = correct + correctResult(aa,8);
        total = total + 1;        
            
        return ((100/total)*correct);
            
    }
    private int correctResult(String [] a, int i) {
        String[] r1, r2;
        r1 = new String[a.length];
        r2 = new String[a.length];
        
        r1 = Arrays.copyOf(a,a.length);
        r2 = Arrays.copyOf(a,a.length);
        
        if (Arrays.equals( master.luna(r1,i), estudent.puzzle2Solution(r2,i) )  ) {
            return 1;
        }
        else {
            return 0;
        }    
    }    
}