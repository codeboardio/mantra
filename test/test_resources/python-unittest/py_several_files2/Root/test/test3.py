from Root import c
import unittest
class test3(unittest.TestCase):
	def test_cc1(self):
		self.assertEqual(c.bar1()+12,13)
	def test_cc2(self):
		self.assertEqual(c.bar2()*c.bar2(),4)
if __name__ == '__main__':
	unittest.main()
