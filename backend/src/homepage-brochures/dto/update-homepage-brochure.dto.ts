import {
  PartialType,
} from '@nestjs/swagger';

import {
  CreateHomepageBrochureDto,
} from './create-homepage-brochure.dto';

export class UpdateHomepageBrochureDto
  extends PartialType(
    CreateHomepageBrochureDto,
  )
{}