public class SolLuna {

    public String[] luna (String[] a, int i) {
        if (i > 0) {
            mirror(a,i-1);
        }
        if (i>=0 && i<a.length) {
                hash(a,i) ;
        }
        return a;
    }

    public void mirror (String[] a, int limit) {
        int index=0;
        String newS;
        while (index<limit && index<a.length) {
            newS = a[index];
            newS = new StringBuffer(newS).reverse().toString();
            //System.out.println(newS);
            a[index] = newS;
            index++;
        }
    }

    public void hash (String[] a, int i) {
        int index=i;
        String newS;
        while (index<a.length) {
            newS = a[index];
            int j = 0;
            String res = "";
            while (j< newS.length()) {
                res += (int)a[index].charAt(j) + i;
                j++;
            }
            //newS = Integer.toString(newS.hashCode());
            //System.out.println(newS);
            a[index] = res;
            index++;
        }
    }

}