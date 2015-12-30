from Root import application
import unittest
class test1(unittest.TestCase):
	def test_one(self):
		self.assertEqual(3,1)
if __name__ == '__main__':
	unittest.main()
