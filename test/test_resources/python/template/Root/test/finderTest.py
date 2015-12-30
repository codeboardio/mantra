from Root.src.main import minimum
import unittest

class finderTest(unittest.TestCase):
        def test_sort(self):
                self.assertEqual(minimum([1,2,3,13,16,17]),1)

        def test_sort_desc(self):
                self.assertEqual(minimum([17,16,13,7,4,2]),2)

        def test_unsort(self):
                self.assertEqual(minimum([17,216,23,13,8, 14,8,22,230]),8)

        def test_zero(self):
                self.assertEqual(minimum([17,216,0,13,8, 14,8,22,230]),0)

if __name__ == '__main__':
        unittest.main()
