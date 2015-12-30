import org.junit.Test;
import static org.junit.Assert.*;
public class TestC {
@Test
public void testTimes() {
 C my = new C();
int result = my.times(3, 2);
assertEquals(6, result); } 
@Test
public void testPlus2() {
 C my = new C();
int result = my.times(5, 2);
assertEquals(10, result); }}