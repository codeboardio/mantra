from Root import b
import unittest
class test1(unittest.TestCase):
	def test_shuffle(self):
		self.assertEqual(b.add(1,2),3)
	def test_add(self):
		self.assertEqual(b.add(4,2),6)
	def test_addFail(self):
		self.assertEqual(b.add(1,2),4)
if __name__ == '__main__':
	unittest.main()
