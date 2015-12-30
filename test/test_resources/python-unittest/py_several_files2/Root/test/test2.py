from Root import c
import unittest
class test2(unittest.TestCase):
	def test_barFail3(self):
		self.assertEqual(c.bar1()+c.bar2()+c.bar1(),44)
	def test_barFFFail(self):
		self.assertEqual(c.bar1()-c.bar2()-c.bar1(),23)
	def test_c11(self):
		self.assertEqual(c.bar1(),1)
	def test_c21(self):
		self.assertEqual(c.bar2(),2)
	def test_barFail1(self):
		self.assertEqual(c.bar1()+c.bar2(),4)
if __name__ == '__main__':
	unittest.main()
