from Root import c_main
from Root.p1 import b
from Root.p1 import c
import unittest
class test3(unittest.TestCase):
	def test_shuffle(self):
		self.assertEqual(c_main.bar1()+b.foo()+c.bar(),31)
if __name__ == '__main__':
	unittest.main()
