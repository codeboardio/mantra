from Root import c
import unittest
class test4(unittest.TestCase):
	def test_cc14(self):
		self.assertEqual(c.bar1()+12,13)
	def test_cc24(self):
		self.assertEqual(c.bar2()*c.bar2(),4)
	def test_cc144(self):
		self.assertEqual(c.bar1()+12,13)
	def test_cc245(self):
		self.assertEqual(c.bar2()*c.bar2(),4)
	def test_barFail43(self):
		self.assertEqual(c.bar1()+c.bar2()+c.bar1(),44)
	def test_barFFFail4(self):
		self.assertEqual(c.bar1()-c.bar2()-c.bar1(),23)
	def test_barFFFail41(self):
		self.assertEqual(c.bar1()-c.bar2()-c.bar1(),23)
if __name__ == '__main__':
	unittest.main()
