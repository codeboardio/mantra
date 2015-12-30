from Root import c
import unittest
class test2(unittest.TestCase):
	def test_c1(self):
		self.assertEqual(c.bar1(),1)
	def test_c2(self):
		self.assertEqual(c.bar2(),2)
	def test_barFail(self):
		self.assertEqual(c.bar1()+c.bar2(),4)
if __name__ == '__main__':
	unittest.main()
