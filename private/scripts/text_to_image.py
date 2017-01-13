import sys
import os
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
import textwrap
import file_manager
import numpy as np

def text_to_img(text):
    """
    Convert a text string into an image

    """
    item = textwrap.wrap(text, width=40)
    
    img = Image.new('RGB', (100,100), "white")
    usr_font = ImageFont.truetype("arial.ttf", 50)
    d_text = ImageDraw.Draw(img)
    
    height = 0
    width = 0
    for line in item:
        w,h = d_text.textsize(line, font=usr_font)
        height += h
        if w > width:
            width = w
    img = img.resize((width+5,height+5))
    d_text = ImageDraw.Draw(img)

    x, y = 0, 0
    for line in item:
        d_text.text((x,y), line, (0,0,0),font=usr_font)
        w,h = d_text.textsize(line, font=usr_font)
        y += h

    return img
    

def sf_mturk_data_prep(data_path, out_path, num_ideas):
    """
    Pull a random set of ideas out of all ideas and translate the 
    ideas to images for likert ratings using mturk

    """
    if not os.path.exists(out_path):
        os.makedirs(out_path)

    prompt_file = os.path.join(data_path, "prompts.json")
    idea_file = os.path.join(data_path, "ideas.json")
    prompts = file_manager.decode_json_file(prompt_file)
    ideas = file_manager.decode_json_file(idea_file)
    promptID = prompts[0]['_id']
    print "Prompt: " + prompts[0]['question']
    ideas = [i for i in ideas 
                if i['promptID'] == promptID]
    subset = np.random.choice(ideas, int(num_ideas), replace=False)

    print "Number of Ideas: %d" % len(subset)
    
    for idea in subset:
        img = text_to_img(idea['content'])
        file_name = os.path.join(out_path, idea['_id'] + ".png")
        img.save(file_name, "PNG")


if __name__ == "__main__":
    data_path = sys.argv[1].split(".")[0]
    out_path = sys.argv[2].split(".")[0]
    num_ideas = sys.argv[3]
    print data_path
    print out_path
    print num_ideas
    sf_mturk_data_prep(data_path, out_path, num_ideas)
    # name = sys.argv[1].split(".")[0]
# 
    # items = []
   #  
    # with open(sys.argv[1]) as f:
        # for line in f:
            # items.append(line.rstrip())
   #  
    # file_path = os.path.abspath(name) 
    # if not os.path.exists(file_path):
        # os.makedirs(file_path)
# 
    # for idx, item in enumerate(items):
        # img = text_to_img(item)
        # file_name = os.path.join(file_path, str(idx) + ".png")
        # img.save(file_name, "PNG")

    # if not os.path.exists(name):
        # os.makedirs(name)

    # for idx, item in enumerate(items):
        # item = textwrap.wrap(item, width=40)
       #  
        # img = Image.new('RGB', (100,100), "white")
        # usr_font = ImageFont.truetype("arial.ttf", 50)
        # d_text = ImageDraw.Draw(img)
       #  
        # height = 0
        # width = 0
        # for line in item:
            # w,h = d_text.textsize(line, font=usr_font)
            # height += h
            # if w > width:
                # width = w
        # img = img.resize((width+5,height+5))
        # d_text = ImageDraw.Draw(img)
       #  
        # x, y = 0, 0
        # for line in item:
            # d_text.text((x,y), line, (0,0,0),font=usr_font)
            # w,h = d_text.textsize(line, font=usr_font)
            # y += h
# 
        # img.save(name + "/" + str(idx) + ".png","PNG")
        # #img.show()
