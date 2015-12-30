import org.junit.Test;
import static org.junit.Assert.*;
public class Test1 {
@Test
public void testConcatenate() {
 MyUnit myUnit = new MyUnit();
String result = myUnit.concatenate("one", "two");
assertEquals("onetwo", result); } }