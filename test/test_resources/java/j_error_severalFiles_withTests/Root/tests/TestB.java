import org.junit.Test;
import static org.junit.Assert.*;
public class TestB {
@Test
public void testPlus() {
 B my = new B();
int result = my.plus(1, 2);
assertEquals(3, result); } 
@Test
public void testPlus2() {
 B my = new B();
int result = my.plus(5, 2);
assertEquals(7, result); }}